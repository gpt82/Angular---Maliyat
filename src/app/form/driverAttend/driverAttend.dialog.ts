import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import * as moment from 'jalali-moment';
import { concat, Observable, of, Subject } from 'rxjs';
import { AuthService } from '../../core/services/app-auth-n.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import { IntlService } from "@progress/kendo-angular-intl";
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'driverAttend-dialog',
  templateUrl: 'driverAttend.dialog.html',
  styles: [
    '.imagePlaceHolder {border:2px dotted blue;width: 200px;Height: 220px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ]
})
// tslint:disable-next-line: component-class-suffix
export class DriverAttendDialog extends ModalBaseClass implements OnInit {

  form: FormGroup;
  @ViewChild('issueDatePicker') issueDatePicker;

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  driversLoading = false;
  drivers$: Observable<Object | any[]>;
  driversInput$ = new Subject<string>();

  // selesctedDsc = '';
  // selectedIds: number[];
  // selectedTrailer: any;

  driverAttendItems = [];
  branchs = [];

  constructor(
    public dialogRef: MatDialogRef<DriverAttendDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    // public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService,
    private intl: IntlService
  ) {
    super();

  }

  ngOnInit() {
    // this.selesctedDsc = this.data.DriverAttend.selesctedDsc;
    this.loadTrailers();
    this.loadDrivers();
    this.getBranchs();
    // this.getDriverAttendItems();
    this.form = this.fb.group(
      {
        trailerId: [this.data.DriverAttend.trailerId],
        driverId: [this.data.DriverAttend.driverId,{ validators: [Validators.required]}],
        branchId: [this.data.DriverAttend.branchId,{ validators: [Validators.required]}],
        attendDate: [new Date(this.data.DriverAttend.attendDate),{ validators: [Validators.required], updateOn: 'change' }],//[this.data.DriverAttend.attendDate, { validators: [Validators.required], updateOn: 'change' }],
        needDate: this.data.DriverAttend.needDate,
        description: [this.data.DriverAttend.description,{ validators: [Validators.required]}],
        desNotLoaded: this.data.DriverAttend.desNotLoaded,
        agendaNumber: this.data.DriverAttend.agendaNumber,

      },
      { updateOn: 'change' }
    );

  }
  
  public valueChange(value: string): void {
    console.log("valueChange", value);
  }
  private loadDrivers() {
    this.drivers$ = concat(
      of([
        {
          id: this.data.DriverAttend.driverId,
          title: this.data.DriverAttend.driverName
        }
      ]),
      this.driversInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.driversLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/drivers/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.driversLoading = false))
          )))
    );
  }
  private loadTrailers() {
    this.trailers$ = concat(
      of([
        {
          id: this.data.DriverAttend.trailerId,
          title: this.data.DriverAttend.trailerPlaque
        }
      ]),
      this.trailersInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.trailersLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/trailers/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.trailersLoading = false))
          )
        )
      )
    );
  }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }
  getUrl(endPoint) {
    return endPoint;
  }

  onClose(): void {
    if (!this.form.dirty) { this.dialogRef.close({ data: null, state: 'cancel' }); } else {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '250px',
        data: { state: 'ok' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.state === 'confirmed') {
          this.dialogRef.close({ data: null, state: 'cancel' });
        }
      });
    }
  }
  popUpCalendar1() {
    this.issueDatePicker.open();
  }
  onSave(): void {
    let d= new Date( this.form.get('attendDate').value).setHours(20,20);
    if (this.form.valid) {
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });
      const driverAttend = JSON.stringify({
        // BranchId: this.data.DriverAttend.branchId,
        AttendDate: moment.from(this.form.get('attendDate').value, 'en').utc(true).toJSON(),//;this.form.get('attendDate').value,
        NeedDate: moment.from(this.form.get('needDate').value, 'en').utc(true).toJSON(),
        TrailerId: this.form.get('trailerId').value,
        BranchId: this.form.get('branchId').value,
        DriverId: this.form.get('driverId').value,
        Description: this.form.get('description').value,
        DesNotLoaded: this.form.get('desNotLoaded').value,
        AgendaNumber: this.form.get('agendaNumber').value
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getEntryPointUrl() + this.data.DriverAttend.id, driverAttend,
            { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit driverAttend');
              console.log(error);
            }
          );
      } else {
        this.create();
      }
    }
  }

  edit(): void {


    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });


  }
  public handleChange(value: Date) {
    // Update the JSON departureTime string date
    this.form.get('attendDate').setValue(this.intl.formatDate(
      value,
      "yyyy-MM-dd HH:mm:ss"
    ));

    // this.output = JSON.stringify(this.model);
    // this.user = this.parse(this.model);
  }
  create(): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .post(
        this.getEntryPointUrl(),
        JSON.stringify({

          AttendDate: moment.from(this.form.get('attendDate').value, 'en').utc(true).toJSON(),
          NeedDate: moment.from(this.form.get('needDate').value, 'en').utc(true).toJSON(),
          TrailerId: this.form.get('trailerId').value,
          DriverId: this.form.get('driverId').value,
          BranchId: this.authService.selectedBranchId,
          Description: this.form.get('description').value,
          DesNotLoaded: this.form.get('desNotLoaded').value,
          AgendaNumber: this.form.get('agendaNumber').value
        }),
        { headers: headers1 }
      )
      .subscribe(
        result => {
          this.dialogRef.close({ state: 'successful' });
        },
        (error: any) => {
          console.log('create driverAttend');
          console.log(error);
        }
      );

  }

  getEntryPointUrl() {
    return '/v1/api/DriverAttend/';
  }
}
