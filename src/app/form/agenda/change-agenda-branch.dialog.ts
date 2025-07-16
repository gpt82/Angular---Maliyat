import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { AgendaState } from './dtos/AgendaState';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

@Component({
  selector: "change-agenda-branch.dialog",
  templateUrl: 'change-agenda-branch.dialog.html'
})
export class ChangeAgendaBranch extends ModalBaseClass {
  @ViewChild('form1')
  form1;
  @ViewChild('form2')
  form2;

  agendaFetched = false;
  agenda: any;
  branchId: number | null = null;
  public branches: any[];
  WaybillNumber: string;
  WaybillSeries: string;
  constructor(
    public dialogRef: MatDialogRef<ChangeAgendaBranch>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public authService: AuthService
  ) {
    super();
    this.getBranchs();
  }
  getBranchs(): void {
    this.http
    .get('/v1/api/Lookup/branchs')
    .subscribe((result: ILookupResultDto[]) => (this.branches = result));
  }
  
  onClose(): void {
    this.dialogRef.close({ data: null, state: 'cancel' });
  }
  onSave(): void {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http
        .put(
          this.getUrl() + 'changeBranch/'+ this.agenda.id,
          JSON.stringify({
            branchId: this.branchId
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            // this.dialogRef.close({ state: 'successful' });
            this.OnSearchAgain();
            this.branchId = null;
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
      this.http.get(this.getUrl()+ 'waybill/' + waybill).subscribe(result => {
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
            this.data.dialogTitle = 'تغییر شعبه بارنامه';
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
    return '/v1/api/Agenda/';
  }
}
