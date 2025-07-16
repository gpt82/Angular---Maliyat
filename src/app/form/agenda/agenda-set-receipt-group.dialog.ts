import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormBuilder, Validators } from '@angular/forms';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'agenda-set-receipt-group-dialog',
  templateUrl: 'agenda-set-receipt-group.dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class AgendaSetReceiptGroup extends ModalBaseClass implements OnInit {
  date;
  public branches: any[];
  @ViewChild('picker') picker;
  @ViewChild('pickerfrom') pickerfrom;
  @ViewChild('pickerto') pickerto;
  constructor(
    public dialogRef: MatDialogRef<AgendaSetReceiptGroup>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: FormBuilder,
  ) {
    super();
  }
  ngOnInit() {
    this.getBranchs();
    this.form = this.fb.group({
      piadNumber: ["", Validators.required],
      payDate: ["", Validators.required],
      fromDate: "",
      toDate: "",
      branchId: "",
    }, { updateOn: 'blur' });
    
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
    if (this.form.valid) {
      this.dialogRef.close({
        state: 'successful',
        isPaid: true,
        piadNumber: this.form.get('piadNumber').value,
        branchId: this.form.get('branchId').value,
        payDate: moment
          .from(this.form.get('payDate').value, 'en')
          .utc(true)
          .toJSON(),
        fromDate: moment
          .from(this.form.get('fromDate').value, 'en')
          .utc(true)
          .toJSON(),
        toDate: moment
          .from(this.form.get('toDate').value, 'en')
          .utc(true)
          .toJSON()
      });
    }
  }
  onIgnore(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        state: 'successful',
        isPaid: false,
        piadNumber: '',
        payDate: null
      });
    }
  }
  popUpCalendar() {
    this.picker.open();
  }
  popUpCalendarfrom() {
    this.pickerfrom.open();
  }
  popUpCalendarto() {
    this.pickerto.open();
  }
  getUrl() {
    return '/v1/api/Agenda/receipt/';
  }
}
