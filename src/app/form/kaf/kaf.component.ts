import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { KafDialog } from './kaf.dialog';
import * as moment from 'jalali-moment';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { ReportService } from '../../shared/services/report-service';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';
import { KafDetailDto } from './dtos/KafDetailDto';
import { Subject } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'kaf-component',
  templateUrl: './kaf.component.html',
  providers: [HttpClient]
})
export class KafComponent extends GridBaseClass implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  isEdit = false;
  showFilter = 'false';
  isSuperAdmin: boolean;
  isBodyTransKaf: boolean;
  drivers: any[] = [];
  public branches: any[];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/Kaf/', dialog);
    this.gridName = 'kafGrid';
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
    this.isBodyTransKaf = this.authService.hasRole(
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
    // this.getLookups();
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

  onCreate(): void {
    const kaf = new KafDetailDto(null);
    const currentDate = moment();
    const dialogRef = this.dialog.open(KafDialog, {
      width: '550',
      height: '480',
      disableClose: true,
      data: {
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D  ساعت  HH:mm',
          showGoToCurrent: 'true'
        },
        Kaf: kaf,
        dialogTitle: 'ایجاد',
        isEdit: false,
        deliveryDate: currentDate.locale('fa')
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
      const kaf = new KafDetailDto(result['entity']);
      const dialogRef = this.dialog.open(KafDialog, {
        width: '550',
        height: '280',
        disableClose: true,
        data: {
          datePickerConfig: {
            drops: 'down',
            format: 'YY/M/D  ساعت  HH:mm',
            showGoToCurrent: 'true'
          },
          Kaf: kaf,
          deliveryDate: moment(kaf.deliveryDate).locale('fa'),
          dialogTitle: 'ویرایش ',
          isEdit: true,
          isSuperAdmin: this.isSuperAdmin
        }
      });
      dialogRef.afterClosed().subscribe(result1 => {
        if (result1 && result1.state === 'successful') {
          if (result1.showAddkafToKafForm) {

          } else {
            this.fillGrid();
          }
        }
      });
    });
  }

  // onShow(): void {
  //   const data = this.selectedRowIds[0].entity;
  //   if (data == null) {
  //     return;
  //   }

  //   const agent = new KafDetailDto(data);
  //   const dialogRef = this.dialog.open(KafDialog, {
  //     width: this.modalCordinate.width,
  //     height: this.modalCordinate.height,
  //     disableClose: true,
  //     data: {
  //       datePickerConfig: {
  //         drops: 'down',
  //         format: 'YY/M/D',
  //         showGoToCurrent: 'true'
  //       },
  //       Kaf: agent,
  //       deliveryDate: moment(agent.deliveryDate).locale('fa'),
  //       dialogTitle: 'نمایش ',
  //       readOnly: true
  //     }
  //   });
  //   dialogRef.afterClosed().subscribe(result => { });
  // }

  onDeleteById(id): void {
    this.deleteEntity(id);
  }
  onListReport() {
    const url = '/v1/api/Report/KafList/';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        // BranchName: result['branchName'],
        CompanyName: result['companyName'],
        FromDate: moment(result['fromDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        ToDate: moment(result['toDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        Description: result['description'],
      };
      const detailRows = [];
      result['details'].forEach(row => {
        detailRows.push({
          Code: row.code,
          DeliveryDate: moment(row.deliveryDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          DriverFullName: row.driverFullName,
          TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
          Rent: row.rent,
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'KafList.mrt',
        options: null,
        dataSources,
        reportTitle: 'گزارش اجاره کفی'
      });

      this.router.navigate(['form/report']);
    });
  }
  getUrl() {
    return '/v1/api/Kaf/';
  }

  onClose(): void { }

  onKafsListReport(): void {
    const url = '/v1/api/Report/KafsList/';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        BranchName: result['branchName'],
        CompanyName: result['companyName'],
        kafManufacturerName: result['kafManufacturerName'],
        kafManufacturerGroupName: result['kafManufacturerGroupName'],
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
          Code: row.Code,
          deliveryDate: moment(row.deliveryDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          DriverFullName: row.driverFullName,
          TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
          Rent: row.rent,
          Description: row.description
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'KafList.mrt',
        options: null,
        dataSources,
        reportTitle: 'لیست کفی های اجاره داده شده'
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
