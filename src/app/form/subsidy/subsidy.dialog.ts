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
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'subsidy-dialog',
  templateUrl: 'subsidy.dialog.html',
  styles: [
    '.imagePlaceHolder {border:2px dotted blue;width: 200px;Height: 220px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ]
})
// tslint:disable-next-line: component-class-suffix
export class SubsidyDialog extends ModalBaseClass implements OnInit {

  form: FormGroup;
  @ViewChild('issueDatePicker') issueDatePicker;
  branchs = [];

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  driversLoading = false;
  drivers$: Observable<Object | any[]>;
  driversInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<SubsidyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    // public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    super();

  }

  ngOnInit() {

    this.loadTrailers();
    this.loadDrivers();
    this.getBranchs();
    this.form = this.fb.group(
      {
        trailerId: this.data.Subsidy.trailerId,
        driverId: this.data.Subsidy.driverId,
        branchId: this.data.Subsidy.branchId ?? this.authService.selectedBranchId,
        amount: [this.data.Subsidy.amount,  { validators: [Validators.required], updateOn: 'change' }],
        issueDate: [moment(this.data.Subsidy.issueDate).locale('fa'),
        Validators.required
        ],
        description: [this.data.Subsidy.description, Validators.required]
      },
      // { updateOn: 'blur' }
    );
    // this.form.get('amount').valueChanges.subscribe(() => console.log(this.form.get('amount').value));
  }

  private loadDrivers() {
    this.drivers$ = concat(
      of([
        {
          id: this.data.Subsidy.driverId,
          title: this.data.Subsidy.driverName
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
          )
        )
      )
    );
  }
  private loadTrailers() {
    this.trailers$ = concat(
      of([
        {
          id: this.data.Subsidy.trailerId,
          title: this.data.Subsidy.trailerPlaque
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
    if (this.form.valid) {
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });
      const subsidy = JSON.stringify({
        BranchId: this.form.get('branchId').value,
        Amount: this.form.get('amount').value,
        IssueDate: moment
        .from(this.form.get('issueDate').value, 'en')
        .utc(true)
        .toJSON(), 
        Description: this.form.get('description').value,
        TrailerId: this.form.get('trailerId').value,
        DriverId: this.form.get('driverId').value
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getEntryPointUrl() + this.data.Subsidy.id, subsidy,
            { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit subsidy');
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

  create(): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .post(
        this.getEntryPointUrl(),
        JSON.stringify({
          Amount: this.form.get('amount').value,
          IssueDate: this.form.get('issueDate').value,
          Description: this.form.get('description').value,
          TrailerId: this.form.get('trailerId').value,
          DriverId: this.form.get('driverId').value,
          BranchId: this.form.get('branchId').value
        }),
        { headers: headers1 }
      )
      .subscribe(
        result => {
          this.dialogRef.close({ state: 'successful' });
        },
        (error: any) => {
          console.log('create subsidy');
          console.log(error);
        }
      );

  }
  // onChangeSelectedDriver(item: any) {
  //   if (item !== undefined) {
  //     this.trailers$ =
  //       of([
  //         {
  //           id: item['trailerId'],
  //           title: item['trailerPlaque']
  //         }
  //       ]);
  //     this.form.get('trailerId').setValue(item['trailerId']);
  //   }
  // }
  getEntryPointUrl() {
    return '/v1/api/Subsidy/';
  }
}
