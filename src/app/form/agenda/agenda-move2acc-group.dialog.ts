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
  selector: 'agenda-move2acc-group-dialog',
  templateUrl: 'agenda-move2acc-group.dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class AgendaMove2AccGroupDialog extends ModalBaseClass implements OnInit {
  date;
  public branches: any[];
  @ViewChild('picker') picker;
  @ViewChild('pickerfrom') pickerfrom;
  @ViewChild('pickerto') pickerto;
  constructor(
    public dialogRef: MatDialogRef<AgendaMove2AccGroupDialog>,
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
      fromDate: [moment().locale('fa'), Validators.required],
      toDate: [moment().locale('fa'), Validators.required],
      branchIds: "",
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
        branchIds: this.form.get('branchIds')?.value.join(),
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
        state: 'fail'
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
