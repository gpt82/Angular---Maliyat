import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HavaleDialog } from './havale.dialog';
import * as moment from 'jalali-moment';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
import { IntlService } from '@progress/kendo-angular-intl';
import { HavaleDto } from './dtos/HavaleDto';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { InvoiceService } from '../invoice/invoice.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'havale-component',
  templateUrl: './havale.component.html',
  providers: [HttpClient]
})
export class HavaleComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  trailers: any[] = [];

  public branchs: any[];

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    private invoiceService: InvoiceService
  ) {
    super(http, '/v1/api/Havale/', dialog);
    this.gridName = 'havaleGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
    this.getBranchs();
  }

  ngOnInit() {
    // this.getLookups();
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }
  onCreate(): void {
    const dialogRef = this.dialog.open(HavaleDialog, {
      width: '600px',
      height: '480px',
      disableClose: true,
      data: {
        Havale: new HavaleDto(null),
        dialogTitle: 'افزودن حواله جدید',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }

  onEdit(id: number): void {
    this.getEntity(id).subscribe(result => {
      const havale = new HavaleDto(result['entity']);

      const dialogRef = this.dialog.open(HavaleDialog, {
        width: '600px',
        height: '480px',
        disableClose: true,
        data: {
          Havale: havale,
          dialogTitle: 'ویرایش حواله',
          isEdit: true
        }
      });
      dialogRef.afterClosed().subscribe(result2 => {
        if (result2 && result2.state === 'successful') {
          this.fillGrid();
        }
      });
    });
  }
  onInvoicePrintPreview(id: number) {
    if (id > 0) {
      this.invoiceService.printPreviewInvoice(id);
    } else {
      alert('حواله  تسویه نشده است.');
    }
  }
  onHavalesListReport(): void {
    const url = '/v1/api/Report/HavalesList/';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        BranchName: result['branchName'],
        CompanyName: result['companyName'],
        CarManufacturerName: result['carManufacturerName'],
        CarManufacturerGroupName: result['carManufacturerGroupName'],
        FromDate: moment(result['fromDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        ToDate: moment(result['toDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        Description: result['description'],
        Code: result['code'],
        Name: result['name']
      };
      const detailRows = [];
      result['details'].forEach(row => {
        detailRows.push({
          HavaleNo: row.havaleNo,
          IssueDate: moment(row.issueDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          DriverName: row.driverName,
          DriverAccNumber: row.driverAccNumber,
          TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
          Amount: row.amount,
          BranchName: row.branchName,
          Description: row.description,
          TafsiliAccount: row.tafsiliAccount,
          TotalAccount: row.totalAccount,
          MoeenAccount: row.moeenAccount,
          Markaz: row.markaz,
          Project: row.project,
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'HavaleList.mrt',
        options: null,
        dataSources,
        reportTitle: 'لیست حواله ها '
      });

      this.router.navigate(['form/report']);
    });
  }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/Havale/';
  }

  onClose(): void { }
}
