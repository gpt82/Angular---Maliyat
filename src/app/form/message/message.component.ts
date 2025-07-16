import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialog } from './message.dialog';
import * as moment from 'jalali-moment';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
import { IntlService } from '@progress/kendo-angular-intl';
import { MessageDto } from './dtos/MessageDto';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'message-component',
  templateUrl: './message.component.html',
  providers: [HttpClient]
})
export class MessageComponent extends GridBaseClass implements OnInit {
  isEdit = false;

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/Message/', dialog);
    this.gridName = 'messageGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  ngOnInit() {
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  onCreate(): void {
    const dialogRef = this.dialog.open(MessageDialog, {
      width: '600px',
      height: '520px',
      disableClose: true,
      data: {
        Message: new MessageDto(null),
        dialogTitle: 'افزودن پیام جدید',
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
      const message = new MessageDto(result['entity']);

      const dialogRef = this.dialog.open(MessageDialog, {
        width: '600px',
        height: '520px',
        disableClose: true,
        data: {
          Message: message,
          dialogTitle: '   ویرایش--- فرستنده ' + message.senderTitle,
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
  onConfirmMessage(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        messageText: 'تایید  جهت نهایی شدن.(دیگر قابل ویرایش نخواهد بود)'
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
  onPayMessage(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        messageText: '   نهایی شدن)'
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
  onMessagesListReport(): void {
    const url = '/v1/api/Message/MessageListReport/';

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
          RegisteredDate: moment(row.registeredDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          PersonTitle: row.personTitle,
          Amount: row.amount,
          IsConfirmed: row.isConfirmed,
          IsPayed: row.isPayed,
          MessageNo: row.messageNo,
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'MessageList.mrt',
        options: null,
        dataSources,
        reportTitle: 'لیست تنخواه ها '
      });

      this.router.navigate(['form/report']);
    });
  }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/Message/';
  }

  onClose(): void {}
}
