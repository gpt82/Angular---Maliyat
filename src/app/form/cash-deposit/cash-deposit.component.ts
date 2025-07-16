import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'jalali-moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';
import { CashDepositDialog } from './cash-deposit.dialog';
import { CashDepositDto } from './dtos/CashDepositDto';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { IntlService } from '@progress/kendo-angular-intl';
import { ReportService } from '../../shared/services/report-service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'cash-deposit-component',
  templateUrl: './cash-deposit.component.html',
  providers: [
    HttpClient
  ],


})
export class CashDepositComponent extends GridBaseClass {

  isEdit = false;

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService) {
    super(http, '/v1/api/CashDeposit/', dialog);
    this.gridName = 'CashDepositGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const title = 'ایجادلیست واریز نقدی';
    const currentDate = moment();
    const dialogRef = this.dialog.open(CashDepositDialog, {
      width: '1100px',
      height: '700px',
      disableClose: true,
      data: {
        cashDeposit: new CashDepositDto(null),
        cashDepositList: [],
        dialogTitle: title,
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // if (result.showReport) {
      //   // this.selectedRowIds = [];
      //   this.onAgendaCarsReport(data.id);
      // } else {
      this.fillGrid();
      // }
    });
  }

  onEdit(data): void {
    const title = ' ویرایش لیست پرداخت نقدی';
    this.getEntity(data.id).subscribe(result => {
      const cashDeposit = new CashDepositDto(result['entity']);
      const dialogRef = this.dialog.open(CashDepositDialog, {
        disableClose: true,
        width: '1100px',
        height: '700px',
        data: {
          cashDeposit: cashDeposit,
          cashDepositList: result['entity'].agendaList,
          dialogTitle: title,
          isEdit: true
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        // if (result && result.state === 'successful') {
        this.fillGrid();
        // }
      });
    });
  }
  //

  onCashDepositConfirmed(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        messageText: 'تایید صورتحساب جهت نهایی شدن و پرداخت.(دیگر صورتحساب قابل ویرایش نخواهد بود)'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.state === 'confirmed') {
        const headers1 = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        this.http
          .put(
            this.getUrl() + 'confirmed/' + this.selectedRowIds[0].entity.id,
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
  onPrint() {
    const hdr = {
      userName: this.authService.getFullName()
    };
    const headers = this.getGridFilterHeader();
    this.http.get(this.getUrl() + 'report/' + this.selectedRowIds[0].entity.id, { headers: headers }).subscribe(result => {
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
        ReportTitle: 'گزارش پرداخت نقدی',
      };

      const detailRows = [];
      result['details'].forEach(row => {
        detailRows.push({
          AgendaNumber: 'بابت تسویه بارنامه' + row.agendaNumber,
          ExportDate: moment(row.exportDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          RemainingFare:  row.remainingFare,
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
        reportName: 'CashDeposit_tafsili.mrt',
        options: null,
        dataSources,
        reportTitle: 'گزارش پرداخت نقدی'
      });

      this.router.navigate(['form/report']);
    });
  }
  onTotalPrint(): void {
    const url = '/v1/api/Report/CashDepositList/';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        FromDate: moment(result['fromDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        ToDate: moment(result['toDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        CompanyName: result['companyName'],
        Description: result['description'],
      };
      const detailRows = [];
      result['details'].forEach(row => {
        detailRows.push({
          CashDepositNumber: row.cashDepositNumber,
          RegisteredDate: moment(row.registeredDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          SumFare: row.sumFare,
          SumPreFare: row.sumPreFare,
          SumReward: row.sumReward,
          SumMilkRun: row.sumMilkRun,
          SumRemainingFare: row.sumRemainingFare,
          Total: row.total,
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'CashDepositList.mrt',
        options: null,
        dataSources,
        reportTitle: 'لیست کلی پرداخت نقدی'
      });

      this.router.navigate(['form/report']);
      // this.dialogRef.close({ state: 'successful' });
    });
  }
  // onMali1Report(n: number): void {
  //   const url = '/v1/api/Report/Mali1/';
  //   let ReportTitle, AgendaNumberTitle;
  //   const headers = this.getGridFilterHeader();
  //   this.http.get(url, { headers: headers }).subscribe(result => {
  //     const hdr = {
  //       BranchName: result['branchName'],
  //       CompanyName: result['companyName'],
  //       FromDate: moment(result['fromDate'])
  //         .locale('fa')
  //         .format('YYYY/MM/DD'),
  //       ToDate: moment(result['toDate'])
  //         .locale('fa')
  //         .format('YYYY/MM/DD'),
  //       Description: result['description'],
  //       PreFareTitle: n === 0 ? 'بدهکار' : 'بستانکار',
  //       ReportTitle: ReportTitle
  //     };

  //     const detailRows = [];
  //     result['details'].forEach(row => {
  //       detailRows.push({
  //         AgendaNumber: AgendaNumberTitle + row.agendaNumber,
  //         ExportDate: moment(row.exportDate)
  //           .locale('fa')
  //           .format('YYYY/MM/DD'),
  //         PreFare: n === 0 ? row.preFare : n === 1 ? row.fare : row.reward,
  //         // Fare: row.Fare,
  //         TafsiliAccount: row.tafsiliAccount,
  //         TotalAccount: row.totalAccount,
  //         MoeenAccount: row.moeenAccount,
  //         Markaz: row.markaz,
  //         Project: row.project,

  //       });
  //     });
  //     const dataSources = JSON.stringify({
  //       Mali: detailRows,
  //       ReportTitle: hdr
  //     });
  //     ReportService.setReportViewModel({
  //       reportName: 'Mali2.mrt',
  //       options: null,
  //       dataSources,
  //       reportTitle: n === 1 ? 'گزارش مالی 2 ' : 'گزارش مالی 1 '
  //     });

  //     this.router.navigate(['form/report']);
  //   });
  // }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/CashDeposit/';
  }

  onClose(): void {
  }
}

