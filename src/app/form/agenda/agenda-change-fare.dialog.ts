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
  selector: 'agenda-change-fare-dialog',
  templateUrl: 'agenda-change-fare.dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class AgendaChangeFare extends ModalBaseClass implements OnInit {
  // date;
  BranchIds: [];
  branchs = [];
  tonnageTypes = [];
  tonnageTypeIds = [];
  @ViewChild('pickerfrom') pickerfrom;
  @ViewChild('pickerto') pickerto;
  constructor(
    public dialogRef: MatDialogRef<AgendaChangeFare>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: FormBuilder,
  ) {
    super();
    this.getTonnageTypes();
  }
  ngOnInit() {
    this.getBranchs();
    this.form = this.fb.group({
      fromDate: ["", Validators.required],
      toDate: ["", Validators.required],
      tonnageTypeIds: [],
      branchIds: [],
      farePercent: "0",
      milkrunPercent: "0",
      rewardPercent: "0",
    }, { updateOn: 'blur' });
    
  }
  getTonnageTypes(): void {
    this.http
      .get('/v1/api/Lookup/tonnageTypes')
      .subscribe((result: ILookupResultDto[]) => (this.tonnageTypes = result));
  }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }
  onClose(): void {
    this.dialogRef.close({ data: null, state: 'cancel' });
  }
  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        state: 'successful',
        tonnageTypeIds: this.form.get('tonnageTypeIds')?.value.join(),
        branchIds: this.form.get('branchIds')?.value.join(),
        fromDate: moment
          .from(this.form.get('fromDate').value, 'en')
          .utc(true)
          .toJSON(),
        toDate: moment
          .from(this.form.get('toDate').value, 'en')
          .utc(true)
          .toJSON(),
         farePercent: this.form.get('farePercent').value,
         milkrunPercent: this.form.get('milkrunPercent').value,
         rewardPercent: this.form.get('rewardPercent').value, 
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
  popUpCalendarfrom() {
    this.pickerfrom.open();
  }
  popUpCalendarto() {
    this.pickerto.open();
  }
  getUrl() {
    return '/v1/api/Agenda/changefare/';
  }
}
