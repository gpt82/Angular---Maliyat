import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SofteDialog } from './softe.dialog';
import * as moment from 'jalali-moment';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { SofteDto } from './dtos/SofteDto';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
import { IntlService } from '@progress/kendo-angular-intl';
import { InvoiceService } from '../invoice/invoice.service';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'softe-component',
  templateUrl: './softe.component.html',
  providers: [HttpClient]
})
export class SofteComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  trailers: any[] = [];
  public branches: any[];
  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    private invoiceService: InvoiceService
  ) {
    super(http, '/v1/api/Softe/', dialog);
    this.gridName = 'softeGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  ngOnInit() {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe(result => (this.branches = Normalize(result)));
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(SofteDialog, {
      width: '600px',
      height: '445px',
      disableClose: true,
      data: {
        Softe: new SofteDto(null),
        dialogTitle: 'افزودن سفته جدید',
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
      const softe = new SofteDto(result['entity']);

      const dialogRef = this.dialog.open(SofteDialog, {
        width: '600px',
        height: '445px',
        disableClose: true,
        data: {
          Softe: softe,
          dialogTitle: 'ویرایش فاکتور راننده',
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
  onSoftesListReport(): void {
    const url = this.getUrl() + 'SofteListReport/';

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
          IssueDate: moment(row.IssueDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          DriverTitle: row.driverTitle,
          PlaqueTitle: row.plaqueTitle,
          Amount: row.amount,
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
        reportName: 'SofteList.mrt',
        options: null,
        dataSources,
        reportTitle: 'لیست  سفته رانندگان '
      });

      this.router.navigate(['form/report']);
    });
  }
  onMaliReport(): void {
    const url = this.getUrl() + 'SofteListReport/';
    let ReportTitle, AgendaNumberTitle;

    ReportTitle = 'گزارش مالی هزینه سفته رانندگان ';
    AgendaNumberTitle = ' بابت  سفته برای';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        BranchName: result['branchName'],
        CompanyName: result['companyName'],
        FromDate: moment(result['fromDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        ToDate: moment(result['toDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        Description: result['description'],
        PreFareTitle: 'بستانکار',
        Code: result['code'],
        Name: result['name'],
        ReportTitle: ReportTitle
      };

      const detailRows = [];
      result['details'].forEach(row => {
        detailRows.push({
          AgendaNumber: AgendaNumberTitle + row.plaqueTitle.replace('ایران', '-'),
          // BodyNumber: row.bodyNumber,
          ExportDate: moment(row.issueDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          PreFare: row.amount,
          // Fare: row.Fare,
          TafsiliAccount: row.tafsiliAccount,
          TotalAccount: row.totalAccount,
          MoeenAccount: row.moeenAccount,
          Markaz: row.markaz,
          Project: row.project,

        });
      });
      const dataSources = JSON.stringify({
        Mali: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'Mali2.mrt',
        options: null,
        dataSources,
        reportTitle: 'گزارش مالی سفته رانندگان'
      });

      this.router.navigate(['form/report']);
    });
  }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/Softe/';
  }

  onClose(): void { }
  onInvoicePrintPreview(id: number) {
    if (id > 0) {
      this.invoiceService.printPreviewInvoice(id);
    } else {
      alert('  تسویه نشده است.');
    }
  }
}
