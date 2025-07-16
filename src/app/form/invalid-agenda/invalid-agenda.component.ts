import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { InvalidAgendaDialog } from './invalid-agenda.dialog';
import * as moment from 'jalali-moment';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { InvalidAgendaDto } from './dtos/InvalidAgendaDto';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
import { IntlService } from '@progress/kendo-angular-intl';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'invalid-agenda-component',
  templateUrl: './invalid-agenda.component.html',
  providers: [HttpClient]
})
export class InvalidAgendaComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  trailers: any[] = [];

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/InvalidAgenda/', dialog);
    this.gridName = 'invalid-agendaGrid';
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
    const dialogRef = this.dialog.open(InvalidAgendaDialog, {
      width: '600px',
      height: '380px',
      disableClose: true,
      data: {
        InvalidAgenda: new InvalidAgendaDto(null),
        dialogTitle: 'افزودن بارنامه باطله جدید',
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
      const invalidAgenda = new InvalidAgendaDto(result['entity']);

      const dialogRef = this.dialog.open(InvalidAgendaDialog, {
        width: '600px',
        height: '380px',
        disableClose: true,
        data: {
          InvalidAgenda: invalidAgenda,
          dialogTitle: 'ویرایش بارنامه باطله  ',
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
  onInvalidAgendasListReport(): void {
    const url = '/v1/api/Report/InvalidAgendasList/';

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
          Description: row.dsc
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'InvalidAgendaList.mrt',
        options: null,
        dataSources,
        reportTitle: 'صورتحساب مالی رانندگان '
      });

      this.router.navigate(['form/report']);
    });
  }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }
  onConfirmInvalidAgenda(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        messageText: 'تایید ابطال بارنامه)'
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

  getUrl() {
    return '/v1/api/InvalidAgenda/';
  }

  onClose(): void {}
}
