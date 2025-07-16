import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DriverAttendDialog } from './driverAttend.dialog';
import * as moment from 'jalali-moment';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { DriverAttendDto } from './dtos/DriverAttend';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
import { IntlService } from '@progress/kendo-angular-intl';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'driverAttend-component',
  templateUrl: './driverAttend.component.html',
  providers: [HttpClient]
})
export class DriverAttendComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  trailers: any[] = [];
  public branches: any[];
  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/DriverAttend/', dialog);
    this.gridName = 'driverAttendGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  ngOnInit() {
    this.http
    .get('/v1/api/Lookup/branchs')
    .subscribe((result: ILookupResultDto[]) => (this.branches = result));
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(DriverAttendDialog, {
      width: '600px',
      height: '445px',
      disableClose: true,
      data: {
        DriverAttend: new DriverAttendDto(null),
        dialogTitle: 'افزودن ورودی جدید',
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
      const driverAttend = new DriverAttendDto(result['entity']);

      const dialogRef = this.dialog.open(DriverAttendDialog, {
        width: '600px',
        height: '445px',
        disableClose: true,
        data: {
          DriverAttend: driverAttend,
          dialogTitle: 'ویرایش ورودی راننده',
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
  onDriverAttendsListReport(): void {
    const url = '/v1/api/Report/DriverAttendsList/';

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
          AttendDate: row.attendDate,
          NeedDate: row.needDate,
          BranchName: row.branchName,
          Description: row.description,
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'DriverAttendList.mrt',
        options: null,
        dataSources,
        reportTitle: 'لیست ورودی رانندگان '
      });

      this.router.navigate(['form/report']);
    });
  }
  // onMaliReport(): void {
  //   const url = '/v1/api/Report/DriverAttendsList/';
  //   let ReportTitle, AgendaNumberTitle;

  //   ReportTitle = 'گزارش مالی ورودی رانندگان ';
  //   AgendaNumberTitle = ' بابت  جریمه';

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
  //       PreFareTitle: 'بستانکار',
  //       Code: result['code'],
  //       Name: result['name'],
  //       ReportTitle: ReportTitle
  //     };

  //     const detailRows = [];
  //     result['details'].forEach(row => {
  //       detailRows.push({
  //         // AgendaNumber: AgendaNumberTitle + row.trailerPlaque.replace('ایران', '-'),
  //         AgendaNumber: ' موارد: ' + row.selectedDsc +' توضیحات: ' +row.description,
  //         // BodyNumber: row.bodyNumber,
  //         ExportDate: moment(row.issueDate)
  //           .locale('fa')
  //           .format('YYYY/MM/DD'),
  //         PreFare: row.amount,
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
  //       reportTitle: 'گزارش مالی جرایم رانندگان'
  //     });

  //     this.router.navigate(['form/report']);
  //   });
  // }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/DriverAttend/';
  }

  onClose(): void { }
  // onInvoicePrintPreview(id: number) {
  //   if (id > 0) {
  //     this.invoiceService.printPreviewInvoice(id);
  //   } else {
  //     alert('  تسویه نشده است.');
  //   }
  // }
}
