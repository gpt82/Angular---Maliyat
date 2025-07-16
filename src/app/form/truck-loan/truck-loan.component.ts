import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TruckLoanDialog } from './truck-loan.dialog';
import * as moment from 'jalali-moment';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { TruckLoanDto } from './dtos/TruckLoanDto';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
import { IntlService } from '@progress/kendo-angular-intl';
import { InvoiceService } from '../invoice/invoice.service';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'truck-loan-component',
  templateUrl: './truck-loan.component.html',
  providers: [HttpClient]
})
export class TruckLoanComponent extends GridBaseClass implements OnInit {
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
    super(http, '/v1/api/TruckLoan/', dialog);
    this.gridName = 'truckLoanGrid';
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
    const dialogRef = this.dialog.open(TruckLoanDialog, {
      width: '600px',
      height: '445px',
      disableClose: true,
      data: {
        TruckLoan: new TruckLoanDto(null),
        dialogTitle: 'افزودن وام جدید',
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
      const truckLoan = new TruckLoanDto(result['entity']);

      const dialogRef = this.dialog.open(TruckLoanDialog, {
        width: '600px',
        height: '445px',
        disableClose: true,
        data: {
          TruckLoan: truckLoan,
          dialogTitle: 'ویرایش وام ',
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
  onTruckLoansListReport(): void {
    const url = this.getUrl() + 'TruckLoanListReport/';

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
          PlaqueTitle: row.plaqueTitle.replace('ایران', '-'),
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
        reportName: 'TruckLoanList.mrt',
        options: null,
        dataSources,
        reportTitle: 'لیست  فاکتور رانندگان '
      });

      this.router.navigate(['form/report']);
    });
  }
  onMaliReport(): void {
    const url = this.getUrl() + 'TruckLoanListReport/';
    let ReportTitle, AgendaNumberTitle;

    ReportTitle = 'گزارش مالی فاکتور رانندگان ';
    AgendaNumberTitle = '  بابت  فاکتور از';

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
        reportTitle: 'گزارش مالی فاکتور رانندگان'
      });

      this.router.navigate(['form/report']);
    });
  }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/TruckLoan/';
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
