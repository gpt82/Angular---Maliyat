import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ReplaceTrailerDialog } from './replace-trailer.dialog';
import * as moment from 'jalali-moment';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { ReplaceTrailerDto } from './dtos/ReplaceTrailerDto';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
import { IntlService } from '@progress/kendo-angular-intl';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { InvoiceService } from '../invoice/invoice.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'replace-trailer-component',
  templateUrl: './replace-trailer.component.html',
  providers: [HttpClient]
})
export class ReplaceTrailerComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  trailers: any[] = [];

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    private invoiceService: InvoiceService
  ) {
    super(http, '/v1/api/ReplaceTrailer/', dialog);
    this.gridName = 'replace-trailerGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  ngOnInit() {
    // this.getLookups();
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(ReplaceTrailerDialog, {
      width: '600px',
      height: '550px',
      disableClose: true,
      data: {
        ReplaceTrailer: new ReplaceTrailerDto(null),
        dialogTitle: 'جایگزینی تریلر جدید',
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
      const replaceTrailer = new ReplaceTrailerDto(result['entity']);

      const dialogRef = this.dialog.open(ReplaceTrailerDialog, {
        width: '600px',
        height: '550px',
        disableClose: true,
        data: {
          ReplaceTrailer: replaceTrailer,
          dialogTitle: '   جایگزینی تریلر',
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
  onReplaceTrailersListReport(): void {
    const url = '/v1/api/Report/ReplaceTrailersList/';

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
          AgendaNumber: row.agendaNumber,
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
        reportName: 'ReplaceTrailerList.mrt',
        options: null,
        dataSources,
        reportTitle: 'جایگزینی تریلر   '
      });

      this.router.navigate(['form/report']);
    });
  }
  onMaliReport(): void {
    const url = '/v1/api/Report/ReplaceTrailersList/';
    let ReportTitle, AgendaNumberTitle;

    ReportTitle = 'گزارش مالی  جایگزینی تریلی';
    AgendaNumberTitle = '  بابت  جایگزینی';

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
          AgendaNumber: AgendaNumberTitle + row.trailerPlaque.replace('ایران', '-'),
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
        reportTitle: 'گزارش مالی جایگزینی تریلی'
      });

      this.router.navigate(['form/report']);
    });
  }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }
  onConfirmReplaceTrailer(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        messageText: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.state === 'confirmed') {
        const headers1 = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        this.http
          .put(
            this.getUrl() + 'confirm/' + id,
            JSON.stringify({
              State: 2
            }),
            { headers: headers1 }
          )
          .subscribe(() => {
            this.resetSelectedRowIds();
            this.fillGrid();
          });
      }
    });
  }
  onPayReplaceTrailer(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        messageText: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.state === 'confirmed') {
        const headers1 = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        this.http
          .put(
            this.getUrl() + 'pay/' + id,
            JSON.stringify({
              State: 2
            }),
            { headers: headers1 }
          )
          .subscribe(() => {
            this.resetSelectedRowIds();
            this.fillGrid();
          });
      }
    });
  }
  getUrl() {
    return '/v1/api/ReplaceTrailer/';
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
