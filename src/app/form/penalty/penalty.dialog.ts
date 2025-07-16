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

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'penalty-dialog',
  templateUrl: 'penalty.dialog.html',
  styles: [
    '.imagePlaceHolder {border:2px dotted blue;width: 200px;Height: 220px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ]
})
// tslint:disable-next-line: component-class-suffix
export class PenaltyDialog extends ModalBaseClass implements OnInit {

  form: FormGroup;
  @ViewChild('issueDatePicker') issueDatePicker;

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  driversLoading = false;
  drivers$: Observable<Object | any[]>;
  driversInput$ = new Subject<string>();

  selesctedDsc = '';
  selectedIds: number[];
  selectedTrailer: any;

  penaltyItems = [];
  constructor(
    public dialogRef: MatDialogRef<PenaltyDialog>,
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
    this.selesctedDsc = this.data.Penalty.selesctedDsc;
    this.loadTrailers();
    this.loadDrivers();
    this.getPenaltyItems();
    this.form = this.fb.group(
      {
        trailerId: this.data.Penalty.trailerId,
        driverId: this.data.Penalty.driverId,
        amount: [this.data.Penalty.amount, { validators: [Validators.required], updateOn: 'change' }],
        issueDate: [moment(this.data.Penalty.issueDate).locale('fa'),
        Validators.required
        ],
        selectedItems: [this.data.SelectedIds],
        description: [this.data.Penalty.description, Validators.required]
      },
      { updateOn: 'blur' }
    );

  }
  getPenaltyItems() {
    const url = '/v1/api/DriverPenaltyItem/';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url).subscribe(result => {
      this.penaltyItems = result['entityLinkModels'].map(m => m['entity']);
      // this.selectedPenaltyItems = this.data.Penalty.selectedPenaltyItems !== null ?
      //  this.data.Penalty.selectedPenaltyItems.split(',').map(x => +x) : [];
      console.log(this.penaltyItems);
    });
  }
  private loadDrivers() {
    this.drivers$ = concat(
      of([
        {
          id: this.data.Penalty.driverId,
          title: this.data.Penalty.driverName
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
          id: this.data.Penalty.trailerId,
          title: this.data.Penalty.trailerPlaque
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
  onChangeSelected(items: any) {
    this.selesctedDsc = items.map(i => i.name).join();
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
      const penalty = JSON.stringify({
        BranchId: this.data.Penalty.branchId,
        Amount: this.form.get('amount').value,
        IssueDate: this.form.get('issueDate').value,
        Description: this.form.get('description').value,
        TrailerId: this.form.get('trailerId').value,
        DriverId: this.form.get('driverId').value,
        SelectedItems: this.form.get('selectedItems').value.join(),
        SelectedDsc: this.selesctedDsc,
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getEntryPointUrl() + this.data.Penalty.id, penalty,
            { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit penalty');
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
          // BranchId: this.data.Penalty.branchId,
          Amount: this.form.get('amount').value,
          IssueDate: this.form.get('issueDate').value,
          Description: this.form.get('description').value,
          TrailerId: this.form.get('trailerId').value,
          DriverId: this.form.get('driverId').value,
          SelectedItems: this.form.get('selectedItems').value.join(),
          SelectedDsc: this.selesctedDsc,
          BranchId: this.authService.selectedBranchId
        }),
        { headers: headers1 }
      )
      .subscribe(
        result => {
          this.dialogRef.close({ state: 'successful' });
        },
        (error: any) => {
          console.log('create penalty');
          console.log(error);
        }
      );

  }

  getEntryPointUrl() {
    return '/v1/api/Penalty/';
  }
}
