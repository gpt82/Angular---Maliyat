import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormBuilder, Validators } from '@angular/forms';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'agenda-set-receipt-dialog',
  templateUrl: 'agenda-set-receipt.dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class AgendaSetReceipt extends ModalBaseClass implements OnInit {
  date;
  @ViewChild('picker') picker;
  constructor(
    public dialogRef: MatDialogRef<AgendaSetReceipt>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: FormBuilder,
  ) {
    super();
  }
  ngOnInit() {
    this.form = this.fb.group({
      paidlvl2Number: [this.data.paidlvl2Number, Validators.required],
      paidlvl2Date: [this.data.paidlvl2Date, Validators.required],
    }, { updateOn: 'blur' });
    // if (this.data.isEdit === true) {
    //   this.form.setValue({
    //     paidlvl2Number: this.data.paidlvl2Number,
    //     payDate: this.data.payDate,
    //   });
    // }
  }

  onClose(): void {
    this.dialogRef.close({ data: null, state: 'cancel' });
  }
  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        state: 'successful',
        isPaid: true,
        paidlvl2Number: this.form.get('paidlvl2Number').value,
        paidlvl2Date: moment
          .from(this.form.get('paidlvl2Date').value, 'en')
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
        paidlvl2Number: '',
        paidlvl2Date: null
      });
    }
  }
  popUpCalendar() {
    this.picker.open();
  }
  getUrl() {
    return '/v1/api/Agenda/receipt/';
  }
}
