import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AmaniDialog } from './amani.dialog';
import * as moment from 'jalali-moment';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { ReportService } from '../../shared/services/report-service';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';
import { AmaniDetailDto } from './dtos/AmaniDetailDto';
import { Subject } from 'rxjs';
import { InvoiceService } from '../invoice/invoice.service';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'amani-component',
  templateUrl: './amani.component.html',
  providers: [HttpClient]
})
export class AmaniComponent extends GridBaseClass implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  isEdit = false;
  showFilter = 'false';
  isSuperAdmin: boolean;
  isBodyTransAmani: boolean;
  drivers: any[] = [];
  public branches: any[];
  constructor(
    public dialog: MatDialog,
    private router: Router,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    public authService: AuthService,
    private invoiceService: InvoiceService
  ) {
    super(http, '/v1/api/Amani/', dialog);
    this.gridName = 'amaniGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
    this.setModalCordinate(1000, 500);
    // this.isBusy = service.isBusy;
    this.isSuperAdmin = this.authService.hasRole(
      RolesConstants.SuperAdministrators
    );
    this.isBodyTransAmani = this.authService.hasRole(
      RolesConstants.BodyTransmission
    );
  }
  public showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;
    if (
      (element.nodeName === 'TD' || element.nodeName === 'TH') &&
      element.offsetWidth < element.scrollWidth
    ) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }
  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }

  ngOnInit() {
    this.getLookups();
  }

  getLookups(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe(result => (this.branches = Normalize(result)));
  }

  getRowClass({ dataItem, index }) {
    if (dataItem == null) {
      return '';
    }
    return {
      canceled: dataItem.entity.state === 2,
      '': dataItem.entity.state !== 2
    };
  }
  onInvoicePrintPreview(id: number) {
    if (id > 0) {
      this.invoiceService.printPreviewInvoice(id);
    } else {
      alert('  تسویه نشده است.');
    }
  }
  onCreate(): void {
    const car = new AmaniDetailDto(null);
    const currentDate = moment();
    const dialogRef = this.dialog.open(AmaniDialog, {
      width: '200',
      height: '480',
      disableClose: true,
      data: {
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D  ساعت  HH:mm',
          showGoToCurrent: 'true'
        },
        Car: car,
        dialogTitle: 'ایجاد',
        isEdit: false,
        exportDate: currentDate.locale('fa'),
        isSuperAdmin: this.isSuperAdmin
      }
    });
    dialogRef.afterClosed().subscribe(result1 => {
      if (result1 && result1.state === 'successful') {
        this.fillGrid();
      }
    });
  }

  onEdit(id: number): void {
    // let headers1 = new HttpHeaders({ "Content-Type": "application/json" });
    // this.http
    this.getEntity(id).subscribe(result => {
      const car = new AmaniDetailDto(result['entity']);
      const dialogRef = this.dialog.open(AmaniDialog, {
        width: '550',
        height: '280',
        disableClose: true,
        data: {
          datePickerConfig: {
            drops: 'down',
            format: 'YY/M/D  ساعت  HH:mm',
            showGoToCurrent: 'true'
          },
          Car: car,
          exportDate: moment(car.exportDate).locale('fa'),
          dialogTitle: 'ویرایش ',
          isEdit: true,
          isSuperAdmin: this.isSuperAdmin
        }
      });
      dialogRef.afterClosed().subscribe(result1 => {
        if (result1 && result1.state === 'successful') {
          if (result1.showAddCarToAmaniForm) {
            const obj = Object.create({
              waybillNumber: result1.waybillNumber,
              waybillSeries: result1.waybillSeries,
              id: result1.id
            });
            // this.onListAmaniCars(obj);
          } else {
            this.fillGrid();
          }
        }
      });
    });
  }

  onShow(): void {
    const data = this.selectedRowIds[0].entity;
    if (data == null) {
      return;
    }

    const agent = new AmaniDetailDto(data);
    const dialogRef = this.dialog.open(AmaniDialog, {
      width: this.modalCordinate.width,
      height: this.modalCordinate.height,
      disableClose: true,
      data: {
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D',
          showGoToCurrent: 'true'
        },
        Amani: agent,
        exportDate: moment(agent.exportDate).locale('fa'),
        dialogTitle: 'نمایش ',
        readOnly: true
      }
    });
    dialogRef.afterClosed().subscribe(result => { });
  }

  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/Amani/';
  }

  onClose(): void { }

  onAmanisListReport(): void {
    const url = '/v1/api/Report/AmanisList/';

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
      // const branches = [];
      // result['branches'].forEach(row => {
      //   branches.push({
      //     BranchTitle: row.branchTitle,
      //     Count: row.count
      //   });
      // });
      const detailRows = [];
      result['details'].forEach(row => {
        detailRows.push({
          BodyNumber: row.bodyNumber,
          AgendaNumber: row.agendaNumber,
          ExportDate: moment(row.exportDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          SenderCity: row.senderCity,
          SenderCode: row.senderCode,
          DriverFullName: row.driverFullName,
          GuiltyDriverFullName: row.guiltyDriverFullName,
          TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
          SmartCardNumber: row.smartCardNumber,
          Fare: row.fare,
          Description: row.description,
          BranchName: row.branchName,
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
        reportName: 'AmaniCarList.mrt',
        options: null,
        dataSources,
        reportTitle: 'صورتحساب مالی رانندگان '
      });

      this.router.navigate(['form/report']);
    });
  }
  onMaliReport(): void {
    const url = '/v1/api/Report/AmanisList/';
    let ReportTitle, AgendaNumberTitle;

    ReportTitle = 'گزارش مالی امانی ';
    AgendaNumberTitle = ' بابت امانی شدن بدنه ';

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
          AgendaNumber: row.description + row.bodyNumber,
          // BodyNumber: row.bodyNumber,
          ExportDate: moment(row.exportDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          PreFare: row.fare,
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
        reportTitle: 'گزارش مالی سواریهای امانی'
      });

      this.router.navigate(['form/report']);
    });
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }
}
