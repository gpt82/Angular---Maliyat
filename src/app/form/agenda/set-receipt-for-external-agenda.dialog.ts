import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { AgendaState } from './dtos/AgendaState';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  selector: "set-receipt-for-external-agenda",
  templateUrl: 'set-receipt-for-external-agenda.dialog.html'
})
export class SetReceiptFoeEternalAgenda extends ModalBaseClass {
  @ViewChild('form1')
  form1;
  @ViewChild('form2')
  form2;
  canRecive = true;
  agendaFetched = false;
  agenda: any;
  WaybillNumber: string;
  WaybillSeries: string;
  PocketNumber: string;
  constructor(
    public dialogRef: MatDialogRef<SetReceiptFoeEternalAgenda>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public authService: AuthService
  ) {
    super();
  }
  CanRecive() {
    if (this.agenda.receivedDate != null)
      this.canRecive = false;
    else if (['ذوالنوری','رجبی'].some(substring => this.authService.getFullName().includes(substring)))
      this.canRecive = true;
    else if (this.authService.isReadOnlyUser)
      this.canRecive = false;

  }
  onClose(): void {
    this.dialogRef.close({ data: null, state: 'cancel' });
  }
  onSave(): void {
    if (this.agenda.receivedDate === null) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http
        .put(
          this.getUrl() + this.agenda.id,
          JSON.stringify({
            PocketNumber: this.PocketNumber,
            ReceivedDate:
              this.data.receivedDate != null
                ? moment.from(this.data.receivedDate, 'fa').format('YYYY/MM/DD')
                : null
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            // this.dialogRef.close({ state: 'successful' });
            this.OnSearchAgain();
          },
          (error: any) => {
            console.log('set agent received date');
            console.log(error);
          }
        );
    }
  }

  onClearReceiptionDate(): void {

    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .put(
        this.getUrl() + this.agenda.id,
        JSON.stringify({
          ReceivedDate: '0001/01/01'
        }),
        { headers: headers1 }
      )
      .subscribe(
        result => {
          this.dialogRef.close({ state: 'successful' });
        },
        (error: any) => {
          console.log('set agent received date');
          console.log(error);
        }
      );

  }
  OnSearchAgain(): void {
    this.agendaFetched = false;
    this.agenda = null;
    this.data.dialogTitle = 'جستجوی بارنامه';
    this.WaybillNumber = '';
    this.WaybillSeries = '';
  }
  onFetchAgenda(): void {
    let waybill = this.WaybillNumber;
    if (this.WaybillNumber) {
      if (!(this.WaybillSeries === null || this.WaybillSeries === undefined || this.WaybillSeries === '')) {
        waybill = this.WaybillNumber + 'q' + this.WaybillSeries.replace('/', 'p');

      }
      // this.http.get(this.getUrl() + this.WaybillNumber + '/' + this.WaybillSeries).subscribe(result => {
      this.http.get('/v1/api/Agenda/waybill/' + waybill).subscribe(result => {
        if (result['succeeded']) {
          if (result['number'] == null) {
            this.agendaFetched = false;
            this.snackBar.open(result['aggregatedExceptions'].message, 'خطا', {
              duration: 3000,
              panelClass: ['snack-bar-info']
            });
          } else {
            this.agendaFetched = true;
            this.agenda = result;
            this.CanRecive();
            this.data.dialogTitle = 'ثبت رسید بارنامه';
            if (this.agenda.state === AgendaState.Received) {
              this.snackBar.open(
                'برای این بارنامه قبلا تاریخ رسید ثبت شده است.  تاریخ رسید  = ' +
                this.agenda.persianReceivedDate,
                'خطا',
                {
                  duration: 3000,
                  panelClass: ['snack-bar-info']
                }
              );
              // return false;
            }
          }
        } else {
          this.snackBar.open('بارنامه ای با شماره وارد شده یافت نشد', 'خطا', {
            duration: 3000,
            panelClass: ['snack-bar-info']
          });
        }
      });
    }
  }
  getUrl() {
    return '/v1/api/Agenda/receipt/';
  }
}
