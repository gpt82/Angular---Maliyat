import { Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { concat, Observable, of, Subject, merge } from 'rxjs';

import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap
} from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

// const Normalize = data =>
//   data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'kaf-dialog',
  templateUrl: 'kaf.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class KafDialog extends ModalBaseClass implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('deliveryDatePicker') deliveryDatePicker;
  @ViewChild('endDatePicker') endDatePicker;
  form: FormGroup;
  canEditFare: true;
  tonnageTypes = [];

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  driversLoading = false;
  drivers$: Observable<Object | any[]>;
  driversInput$ = new Subject<string>();
  public guaranteeTypes: any[] = [
    { id: 1, label: 'سفته' },
    { id: 2, label: 'چک' },
    { id: 3, label: 'سایر' },
  ]

  constructor(
    public dialogRef: MatDialogRef<KafDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    super();

    this.canEditFare = this.data.isSuperAdmin || !this.data.isEdit;
    if (this.data.readOnly) {
      return;
    }

    this.loadDrivers();
    this.loadTrailers();
  }

  ngOnInit(): void {
    this.CreateForm();
    this.getTonnageTypes();
    // this.formControlValueChanged();
  }

  private CreateForm() {
    this.form = this.fb.group(
      {
        code: [this.data.Kaf.code, Validators.required],
        deliveryDate: moment(this.data.Kaf.deliveryDate).locale('fa'),
        endDate: moment(this.data.Kaf.endDate).locale('fa'),
        driverId: [this.data.Kaf.driverId, Validators.required],
        trailerId: [this.data.Kaf.trailerId, Validators.required],
        rent: [this.data.Kaf.rent, { validators: [Validators.required], updateOn: 'change' }],
        description: this.data.Kaf.description || '',
        // tonnageTypeId: this.data.Kaf.tonnageTypeId,
        guaranteeAmount: [this.data.Kaf.guaranteeAmount, { updateOn: 'change' }],
        guaranteeTypeId: this.data.Kaf.guaranteeTypeId,
        numShipments: [this.data.Kaf.numShipments,Validators.max(255)],
        isActive: this.data.Kaf.isActive
      },
      { updateOn: 'blur' }
    );
  }
  popUpCalendar1() {
    this.deliveryDatePicker.open();
  }
  popUpCalendar2() {
    this.endDatePicker.open();
  }

  getTonnageTypes(): void {
    this.http
      .get('/v1/api/Lookup/tonnageTypes')
      .subscribe((result: ILookupResultDto[]) => (this.tonnageTypes = result));
  }
  private loadDrivers() {
    this.drivers$ = concat(
      of([
        {
          id: this.data.Kaf.driverId,
          title: this.data.Kaf.driverFullName
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
          id: this.data.Kaf.trailerId,
          title: this.data.Kaf.trailerPlaque
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

  onClose(): void {
    if (!this.form.dirty) {
      this.dialogRef.close({ data: null, state: 'cancel' });
    } else {
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

  onSave(): void {
    if (this.form.valid) {
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });

      const kaf = JSON.stringify({
        Code: this.form.get('code').value,
        DeliveryDate:
          this.form.get('deliveryDate').value != null
            ? moment
              .from(this.form.get('deliveryDate').value, 'en')
              .utc(true)
              .toJSON()
            : null,
        EndDate:
          this.form.get('endDate').value != null
            ? moment
              .from(this.form.get('endDate').value, 'en')
              .utc(true)
              .toJSON()
            : null,
        DriverId: this.form.get('driverId').value,
        TrailerId: this.form.get('trailerId').value,
        // TonnageTypeId: this.form.get('tonnageTypeId').value,
        GuaranteeAmount: this.form.get('guaranteeAmount').value,
        NumShipments: this.form.get('numShipments').value,
        Rent: this.form.get('rent').value,
        GuaranteeTypeId: this.form.get('guaranteeTypeId').value,
        Description: this.form.get('description').value || '',
        isActive: this.form.get('isActive').value ,
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getUrl() + this.data.Kaf.id, kaf, { headers: header })
          .subscribe(
            result => {
              const obj = {
                state: 'successful',
                id: result['entity'].id
              };
              this.dialogRef.close(obj);
            },
            (error: any) => {
              console.log('create kaf');
              console.log(error);
            }
          );
      } else {
        this.http.post(this.getUrl(), kaf, { headers: header }).subscribe(
          result => {
            const obj = {
              state: 'successful',
              // bodyNumber: this.form.get('bodyNumber').value,
              id: result['entity'].id
            };
            this.dialogRef.close(obj);
          },
          (error: any) => {
            console.log('create kaf');
            console.log(error);
          }
        );
      }
    }
  }

  // formControlValueChanged() {
  //   const driverId$ = this.form.get('driverId').valueChanges;
  //   driverId$.subscribe(() => {
  //     const driverId = this.form.get('driverId').value;

  //     this.http
  //       .get<DriverDetailDto>(`/v1/api/Driver/${driverId}`)
  //       .subscribe(result => {
  //         const driver = new DriverDetailDto(result['entity']);

  //         if (driver.trailerId > 0) {
  //           this.trailers$ = of([
  //             {
  //               id: driver.trailerId,
  //               title: driver.trailerPlaque
  //             }
  //           ]);
  //           this.form.get('trailerId').setValue(driver.trailerId);
  //         }
  //       });
  //   });
  // }
  // onChangeSelectedDriver(item: any) {
  //   if (item !== undefined && this.form.get('trailerId').value<1) {
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
  getUrl() {
    return '/v1/api/Kaf/';
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }
}
