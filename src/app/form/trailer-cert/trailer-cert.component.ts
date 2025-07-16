import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TrailerCertDialog } from './trailer-cert.dialog';
import * as moment from 'jalali-moment';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { ReportService } from '../../shared/services/report-service';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';
import { TrailerCertDetailDto } from './dtos/TrailerCertDetailDto';
import { Subject } from 'rxjs';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'trailer-cert-component',
  templateUrl: './trailer-cert.component.html',
  providers: [HttpClient]
})
export class TrailerCertComponent extends GridBaseClass implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  isEdit = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/TrailerCert/', dialog);
    this.gridName = 'trailer-certGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
    this.setModalCordinate(1000, 500);
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

  ngOnInit() {  }

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
    const cert = new TrailerCertDetailDto(null);
    const currentDate = moment();
    const dialogRef = this.dialog.open(TrailerCertDialog, {
      width: '550',
      height: '480',
      disableClose: true,
      data: {
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D  ساعت  HH:mm',
          showGoToCurrent: 'true'
        },
        Cert: cert,
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
      const cert = new TrailerCertDetailDto(result['entity']);
      const dialogRef = this.dialog.open(TrailerCertDialog, {
        width: '550',
        height: '480',
        disableClose: true,
        data: {
          datePickerConfig: {
            drops: 'down',
            format: 'YY/M/D  ساعت  HH:mm',
            showGoToCurrent: 'true'
          },
          Cert: cert,
          dialogTitle: 'ویرایش ',
          isEdit: true
        }
      });
      dialogRef.afterClosed().subscribe(result1 => {
        if (result1 && result1.state === 'successful') {
          // if (result1.showAddCarToTrailerCertForm) {
          //   const obj = Object.create({
          //     waybillNumber: result1.waybillNumber,
          //     waybillSeries: result1.waybillSeries,
          //     id: result1.id
          //   });
          //   // this.onListTrailerCertCars(obj);
          // } else {
          this.fillGrid();
          // }
        }
      });
    });
  }

  // onShow(): void {
  //   const data = this.selectedRowIds[0].entity;
  //   if (data == null) {
  //     return;
  //   }

  //   const agent = new TrailerCertDetailDto(data);
  //   const dialogRef = this.dialog.open(TrailerCertDialog, {
  //     width: this.modalCordinate.width,
  //     height: this.modalCordinate.height,
  //     disableClose: true,
  //     data: {
  //       datePickerConfig: {
  //         drops: 'down',
  //         format: 'YY/M/D',
  //         showGoToCurrent: 'true'
  //       },
  //       TrailerCert: agent,
  //       exportDate: moment(agent.exportDate).locale('fa'),
  //       dialogTitle: 'نمایش ',
  //       readOnly: true
  //     }
  //   });
  //   dialogRef.afterClosed().subscribe(result => { });
  // }

  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/TrailerCert/';
  }

  onClose(): void { }

  onTrailerCertsListReport(): void {
    const url = '/v1/api/Report/TrailerCertsList/';

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
          BranchName: row.branchName
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'TrailerCertCarList.mrt',
        options: null,
        dataSources,
        reportTitle: 'صورتحساب مالی رانندگان '
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
