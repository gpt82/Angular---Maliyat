import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DriverAccessoryDialog } from './driver-accessory.dialog';
import * as moment from 'jalali-moment';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { ReportService } from '../../shared/services/report-service';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { AuthService } from '../../core/services/app-auth-n.service';
import { DriverAccessoryDetailDto } from './dtos/DriverAccessoryDetailDto';
import { Subject } from 'rxjs';
import { IntlService } from '@progress/kendo-angular-intl';
import { InvoiceService } from '../invoice/invoice.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'driver-accessory-component',
  templateUrl: './driver-accessory.component.html',
  providers: [HttpClient]
})
export class DriverAccessoryComponent extends GridBaseClass implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  isEdit = false;

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    public authService: AuthService,
    private invoiceService: InvoiceService
  ) {
    super(http, '/v1/api/DriverAccessory/', dialog);
    this.gridName = 'driver-accessoryGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
    // this.setModalCordinate(600, 500);
  }
  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }

  ngOnInit() { }

  onCreate(): void {
    const accessory = new DriverAccessoryDetailDto(null);
    const currentDate = moment();
    const dialogRef = this.dialog.open(DriverAccessoryDialog, {
      width: '550',
      height: '480',
      disableClose: true,
      data: {
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D  ساعت  HH:mm',
          showGoToCurrent: 'true'
        },
        DriverAccessory: accessory,
        dialogTitle: 'ایجاد',
        isEdit: false,
      }
    });
    dialogRef.afterClosed().subscribe(result1 => {
      if (result1 && result1.state === 'successful') {
        this.fillGrid();
      }
    });
  }

  onEdit(id: number): void {
    this.getEntity(id).subscribe(result => {
      const accessory = new DriverAccessoryDetailDto(result['entity']);
      const dialogRef = this.dialog.open(DriverAccessoryDialog, {
        width: '550',
        height: '480',
        disableClose: true,
        data: {
          datePickerConfig: {
            drops: 'down',
            format: 'YY/M/D  ساعت  HH:mm',
            showGoToCurrent: 'true'
          },
          DriverAccessory: accessory,
          dialogTitle: 'ویرایش ',
          isEdit: true
        }
      });
      dialogRef.afterClosed().subscribe(result1 => {
        if (result1 && result1.state === 'successful') {
          // if (result1.showAddCarToDriverAccessoryForm) {
          //   const obj = Object.create({
          //     waybillNumber: result1.waybillNumber,
          //     waybillSeries: result1.waybillSeries,
          //     id: result1.id
          //   });
          //   // this.onListDriverAccessoryCars(obj);
          // } else {
          this.fillGrid();
          // }
        }
      });
    });
  }

  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/DriverAccessory/';
  }

  onClose(): void { }

  onDriverAccessoriesListReport(): void {
    const url = this.getUrl() + 'DriverAccessoryListReport/';

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
          SelectedDsc: row.selectedDsc + '///' + row.description,
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
        reportName: 'DriverAccessoryList.mrt',
        options: null,
        dataSources,
        reportTitle: 'لیست  لوازم متفرقه '
      });

      this.router.navigate(['form/report']);
    });
  }
  onMaliReport(): void {
    const url = this.getUrl() + 'DriverAccessoryListReport/';
    let ReportTitle, AgendaNumberTitle;

    ReportTitle = 'گزارش مالی لوازم متفرقه رانندگان ';
    AgendaNumberTitle = ' بابت  لوازم متفرقه';

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
        reportTitle: 'گزارش لوازم متفرقه رانندگان'
      });

      this.router.navigate(['form/report']);
    });
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  onInvoicePrintPreview(id: number) {
    if (id > 0) {
      this.invoiceService.printPreviewInvoice(id);
    } else {
      alert('  تسویه نشده است.');
    }
  }
}
