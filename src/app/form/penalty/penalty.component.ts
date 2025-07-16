import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PenaltyDialog } from './penalty.dialog';
import * as moment from 'jalali-moment';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { PenaltyDto } from './dtos/PenaltyDto';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
import { IntlService } from '@progress/kendo-angular-intl';
import { InvoiceService } from '../invoice/invoice.service';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'penalty-component',
  templateUrl: './penalty.component.html',
  providers: [HttpClient]
})
export class PenaltyComponent extends GridBaseClass implements OnInit {
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
    super(http, '/v1/api/Penalty/', dialog);
    this.gridName = 'penaltyGrid';
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
    const dialogRef = this.dialog.open(PenaltyDialog, {
      width: '600px',
      height: '445px',
      disableClose: true,
      data: {
        Penalty: new PenaltyDto(null),
        dialogTitle: 'افزودن جریمه جدید',
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
      const penalty = new PenaltyDto(result['entity']);

      const dialogRef = this.dialog.open(PenaltyDialog, {
        width: '600px',
        height: '445px',
        disableClose: true,
        data: {
          Penalty: penalty,
          SelectedIds: penalty.selectedItems?.split(',').map(x => +x),
          dialogTitle: 'ویرایش جریمه راننده',
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
  onPenaltysListReport(): void {
    const url = '/v1/api/Report/PenaltysList/';

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
          IssueDate: moment(row.issueDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          DriverName: row.driverName,
          DriverAccNumber: row.driverAccNumber,
          TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
          Amount: row.amount,
          BranchName: row.branchName,
          SelectedDsc: row.selectedDsc,
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
        reportName: 'PenaltyList.mrt',
        options: null,
        dataSources,
        reportTitle: 'لیست جرایم رانندگان '
      });

      this.router.navigate(['form/report']);
    });
  }
  onMaliReport(): void {
    const url = '/v1/api/Report/PenaltysList/';
    let ReportTitle, AgendaNumberTitle;

    ReportTitle = 'گزارش مالی جرایم رانندگان ';
    AgendaNumberTitle = ' بابت  جریمه';

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
          // AgendaNumber: AgendaNumberTitle + row.trailerPlaque.replace('ایران', '-'),
          AgendaNumber: ' موارد: ' + row.selectedDsc +' توضیحات: ' +row.description,
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
        reportTitle: 'گزارش مالی جرایم رانندگان'
      });

      this.router.navigate(['form/report']);
    });
  }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/Penalty/';
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
