import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

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
  selector: 'havale-dialog',
  templateUrl: 'havale.dialog.html',
  styles: [
    '.imagePlaceHolder {border:2px dotted blue;width: 200px;Height: 220px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ]
})
// tslint:disable-next-line: component-class-suffix
export class HavaleDialog extends ModalBaseClass implements OnInit {

  form: FormGroup;
  @ViewChild('issueDatePicker') issueDatePicker;

  dstBranchs = [];
  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  driversLoading = false;
  drivers$: Observable<Object | any[]>;
  driversInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<HavaleDialog>,
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

    this.getBranchs();
    this.loadTrailers();
    this.loadDrivers();
    this.form = this.fb.group(
      {
        trailerId: this.data.Havale.trailerId,
        driverId: this.data.Havale.driverId,
        dstBranchId: this.data.Havale.dstBranchId,
        havaleNo: [this.data.Havale.havaleNo, Validators.required],
        amount: [this.data.Havale.amount,  { validators: [Validators.required], updateOn: 'change' }],
        issueDate: [moment(this.data.Havale.issueDate).locale('fa'),
        Validators.required
        ],
        description: [this.data.Havale.description, Validators.required]
      },
      // { updateOn: 'blur' }
    );
    // this.form.get('amount').valueChanges.subscribe(() => console.log(this.form.get('amount').value));
  }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.dstBranchs = result));
  }
  private loadDrivers() {
    this.drivers$ = concat(
      of([
        {
          id: this.data.Havale.driverId,
          title: this.data.Havale.driverName
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
          id: this.data.Havale.trailerId,
          title: this.data.Havale.trailerPlaque
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
      const havale = JSON.stringify({
        SrcBranchId: this.data.Havale.srcBranchId,
        DstBranchId: this.form.get('dstBranchId').value,
        HavaleNo: this.form.get('havaleNo').value,
        Amount: this.form.get('amount').value,
        IssueDate: this.form.get('issueDate').value,
        Description: this.form.get('description').value,
        TrailerId: this.form.get('trailerId').value,
        DriverId: this.form.get('driverId').value
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getEntryPointUrl() + this.data.Havale.id, havale,
            { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit havale');
              console.log(error);
            }
          );
      } else {
        this.create();
      }
    }
  }

  create(): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .post(
        this.getEntryPointUrl(),
        JSON.stringify({
        SrcBranchId: this.data.Havale.srcBranchId,
        DstBranchId: this.form.get('dstBranchId').value,
        HavaleNo: this.form.get('havaleNo').value,
        Amount: this.form.get('amount').value,
        IssueDate: this.form.get('issueDate').value,
        Description: this.form.get('description').value,
        TrailerId: this.form.get('trailerId').value,
        DriverId: this.form.get('driverId').value
        }),
        { headers: headers1 }
      )
      .subscribe(
        result => {
          this.dialogRef.close({ state: 'successful' });
        },
        (error: any) => {
          console.log('create havale');
          console.log(error);
        }
      );

  }

  getEntryPointUrl() {
    return '/v1/api/Havale/';
  }
}
