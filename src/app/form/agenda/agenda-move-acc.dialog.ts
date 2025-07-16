import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormBuilder, Validators } from '@angular/forms';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'agenda-move-acc-dialog',
  templateUrl: 'agenda-move-acc.dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class AgendaMoved2AccDialog extends ModalBaseClass implements OnInit {
  date;
  @ViewChild('picker') picker;
  constructor(
    public dialogRef: MatDialogRef<AgendaMoved2AccDialog>,
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
      // paidlvl2Number: [this.data.paidlvl2Number, Validators.required],
      moved2AccDate: this.data.moved2AccDate,
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
        // paidlvl2Number: this.form.get('paidlvl2Number').value,
        moved2AccDate: moment
          .from(this.form.get('moved2AccDate').value, 'en')
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
        // paidlvl2Number: '',
        moved2AccDate: null
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
