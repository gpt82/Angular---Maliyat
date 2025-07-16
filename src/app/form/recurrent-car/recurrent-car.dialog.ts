import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
import { DriverDialog } from '../driver/driver.dialog';
import { DriverDetailDto } from '../driver/dtos/DriverDetailDto';
import { TrailerDialog } from '../trailer/trailer.dialog';
import { TrailerDetailDto } from '../trailer/dtos/TrailerDetailDto';
import { AgentDialog } from '../agent/agent.dialog';
import { AgentDetailDto } from '../agent/dtos/AgentDetailDto';
import { ILookupResultDto } from '@shared/dtos/LookupResultDto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/app-auth-n.service';

// const Normalize = data =>
//   data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'recurrent-car-dialog',
  templateUrl: 'recurrent-car.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class RecurrentCarDialog extends ModalBaseClass implements OnInit {
  @ViewChild('exportDatePicker') exportDatePicker;
  @ViewChild('issueDatePicker') issueDatePicker;
  form: FormGroup;
  canEditFare: true;
  receivers = [];
  carTypes = [];


  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  sendersLoading = false;
  senders$: Observable<Object | any[]>;
  sendersInput$ = new Subject<string>();

  driversLoading = false;
  drivers$: Observable<Object | any[]>;
  driversInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<RecurrentCarDialog>,
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

    // this.getReceivers();
    // this.getDrivers();
    // this.getTrailers();
    this.getReceivers();
    this.getcarTypes();
    this.loadDrivers();
    this.loadSenders();
    this.loadTrailers();
  }

  ngOnInit(): void {
    this.CreateForm();
    this.formControlValueChanged();
  }

  private CreateForm() {
    this.form = this.fb.group(
      {
        bodyNumber: [this.data.Car.bodyNumber, Validators.required],
        exportDate: [
          moment(this.data.Car.exportDate).locale('fa'),
          Validators.required
        ],
        receiverId: [this.data.Car.receiverId, Validators.required],
        senderId: [this.data.Car.senderId, Validators.required],
        driverId: [this.data.Car.driverId, Validators.required],
        trailerId: [this.data.Car.trailerId, Validators.required],
        guiltyDriverId: [this.data.Car.guiltyDriverId],
        guiltyTrailerId: [this.data.Car.guiltyTrailerId],
        carTypeId: this.data.Car.carTypeId,
        fare: [this.data.Car.fare, { validators: [Validators.required], updateOn: 'change' }],
        description: this.data.Car.description || '',
        issueLetterNo: this.data.Car.issueLetterNo || '',
        issueDate: moment(this.data.Car.issueDate).locale('fa')
      },
      { updateOn: 'blur' }
    );
  }
  popUpCalendar1() {
    this.exportDatePicker.open();
  }
  popUpCalendar2() {
    this.issueDatePicker.open();
  }

  onBlurBodyNumber(): void {
    // if (!this.data.isEdit) {
    //   this.http
    //     .get('/v1/api/Car/bodyNumber/' + this.data.Car.bodyNumber)
    //     .subscribe(result => {
    //       if (result) {
    //         const dialogRef = this.dialog.open(ErrorDialog, {
    //           width: '250px',
    //           data: { state: 'ok' }
    //         });
    //       }
    //     });
    // }

    if (
      this.form.get('bodyNumber').value &&
      this.form.get('bodyNumber').value.length > 3
    ) {
      const carTypeCode: string = this.form
        .get('bodyNumber')
        .value.substring(0, 3);
      const carType = this.carTypes.find(function(obj) {
        return obj.alt === carTypeCode;
      });
      if (carType !== undefined && carType != null) {
        this.form.get('carTypeId').setValue(carType.id);
        // this.form.get('carType').setValue(+carType.id);
      }
    }
  }
  private loadDrivers() {
    this.drivers$ = concat(
      of([
        {
          id: this.data.Car.driverId,
          title: this.data.Car.driverTitle
        },
        {
          id: this.data.Car.guiltyDriverId,
          title: this.data.Car.guiltyDriverTitle
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
  private loadSenders() {
    this.senders$ = concat(
      of([
        {
          id: this.data.Car.senderId,
          title: this.data.Car.senderTitle
        }
      ]),
      this.sendersInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.sendersLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/agents/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.sendersLoading = false))
          )
        )
      )
    );
  }

  private loadTrailers() {
    this.trailers$ = concat(
      of([
        {
          id: this.data.Car.trailerId,
          title: this.data.Car.trailerTitle
        },
        {
          id: this.data.Car.guiltyTrailerId,
          title: this.data.Car.guiltyTrailerTitle
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

  getReceivers(): void {
    this.http
      .get('/v1/api/Lookup/senders')
      .subscribe((result: ILookupResultDto[]) => (this.receivers = result));
  }

  getcarTypes(): void {
    this.http
      .get('/v1/api/Lookup/carTypes')
      .subscribe((result: ILookupResultDto[]) => (this.carTypes = result));
  }

  OnNgSelectKeyDown(event: any, type: string) {
    if (event.code === 'F4') {
      event.preventDefault();
      event.stopPropagation();
      if (type === 'driver') {
        this.onCreateDriver();
      } else if (type === 'trailer') {
        this.onCreateTrailer();
      } else if (type === 'receiver') {
        this.onCreateAgent();
      }
      // else if (type === 'sender') {
      //   this.onSenderLookup();
      // }
    } else if (event.code === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  onCreateAgent(): void {
    const dialogRef = this.dialog.open(AgentDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        Agent: new AgentDetailDto(null),
        dialogTitle: 'ایجاد',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
      }
    });
  }

  onCreateTrailer(): void {
    const currentDate = moment();
    const dialogRef = this.dialog.open(TrailerDialog, {
      width: '600px',
      height: '370px',
      disableClose: true,
      data: {
        Trailer: new TrailerDetailDto(null),
        dialogTitle: 'ایجاد',
        datePickerConfig: {
          drops: 'down',
          // format: 'YY/M/D',
          showGoToCurrent: 'true'
        },
        thirdPartyInsuranceDate: currentDate.locale('fa'),
        techDiagnosisInsuranceDate: currentDate.locale('fa'),
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
      }
    });
  }

  onCreateDriver(): void {
    const dialogRef = this.dialog.open(DriverDialog, {
      width: '900px',
      height: '600px',
      disableClose: true,
      data: {
        Driver: new DriverDetailDto(null),
        dialogTitle: 'افزودن راننده جدید',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.trailersInput$ = result.data.selectedItem.trailerPlaque;
        // this.data.Car.driverId = result.data.selectedItem.id;
        // this.data.Car.trailerId = result.data.selectedItem.trailerId;
      }
    });
  }

  onBlurNumber(event): void {
    const trailerId = +event.alt;
    if (trailerId !== undefined && trailerId != null) {
      this.data.Car.trailerId = trailerId;
    }
  }

  incorrectCode(): void {
    this.snackBar.open('کد وارد شده اشتباه می باشد!', 'خطا', {
      duration: 3000,
      panelClass: ['snack-bar-info']
    });
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

      const car = JSON.stringify({
        BodyNumber: this.form.get('bodyNumber').value,
        ExportDate:
          this.form.get('exportDate').value != null
            ? moment
                .from(this.form.get('exportDate').value, 'en')
                .utc(true)
                .toJSON()
            : null,
        ReceiverId: this.form.get('receiverId').value,
        SenderId: this.form.get('senderId').value,
        DriverId: this.form.get('driverId').value,
        GuiltyDriverId: this.form.get('guiltyDriverId').value,
        GuiltyTrailerId: this.form.get('guiltyTrailerId').value,
        TrailerId: this.form.get('trailerId').value,
        CarTypeId: this.form.get('carTypeId').value,
        Fare: this.form.get('fare').value,
        Description: this.form.get('description').value || '',
        IssueLetterNo: this.form.get('issueLetterNo').value || '',
        IssueDate:
        this.form.get('issueDate').value != null
          ? moment
              .from(this.form.get('issueDate').value, 'en')
              .utc(true)
              .toJSON()
          : null,
        BranchId: this.data.Car.branchId || this.authService.selectedBranchId
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getUrl() + this.data.Car.id, car, { headers: header })
          .subscribe(
            result => {
              const obj = {
                state: 'successful',
                bodyNumber: this.form.get('bodyNumber').value,
                id: result['entity'].id
              };
              this.dialogRef.close(obj);
            },
            (error: any) => {
              console.log('create agent');
              console.log(error);
            }
          );
      } else {
        this.http.post(this.getUrl(), car, { headers: header }).subscribe(
          result => {
            const obj = {
              state: 'successful',
              bodyNumber: this.form.get('bodyNumber').value,
              id: result['entity'].id
            };
            this.dialogRef.close(obj);
          },
          (error: any) => {
            console.log('create agent');
            console.log(error);
          }
        );
      }
    }
  }

  // onSenderLookup(): void {
  //   const dialogRef = this.dialog.open(CarManufacturerLookup, {
  //     width: '600px',
  //     height: '600px',
  //     disableClose: true,
  //     data: {
  //       dialogTitle: 'انتخاب گیرنده',
  //       selectedItem: null
  //     }
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result && result.data.selectedItem) {
  //       this.getSenders();
  //       this.data.Car.senderId = result.data.selectedItem.id;
  //     }
  //   });
  // }

  formControlValueChanged() {
    const driverId$ = this.form.get('driverId').valueChanges;
    driverId$.subscribe(() => {
      const driverId = this.form.get('driverId').value;

      this.http
        .get<DriverDetailDto>(`/v1/api/Driver/${driverId}`)
        .subscribe(result => {
          const driver = new DriverDetailDto(result['entity']);

          if (driver.trailerId > 0) {
            this.trailers$ = of([
              {
                id: driver.trailerId,
                title: driver.trailerPlaque
              }
            ]);
            this.form.get('trailerId').setValue(driver.trailerId);
          }
        });
    });
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
  //     this.form.get('guiltyTrailerId').setValue(item['trailerId']);
  //   }
  // }
  getUrl() {
    return '/v1/api/RecurrentCar/';
  }
}
