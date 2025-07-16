import { Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { concat, Observable, of, Subject } from 'rxjs';

import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap
} from 'rxjs/operators';
import { DriverDetailDto } from '../driver/dtos/DriverDetailDto';
import { ILookupResultDto } from '@shared/dtos/LookupResultDto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/app-auth-n.service';
// import { Ng2FileUploadComponent } from '../UploadFile/ng2-file-upload/ng2-file-upload.component';

// const Normalize = data =>
//   data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'amani-dialog',
  templateUrl: 'amani.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class AmaniDialog extends ModalBaseClass implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('exportDatePicker') exportDatePicker;
  @ViewChild('issueDatePicker') issueDatePicker;
  form: FormGroup;
  branchs = [];
  canEditFare: true;
  receivers = [];
  carTypes = [];
  fileNames=[];

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  sendersLoading = false;
  senders$: Observable<Object | any[]>;
  sendersInput$ = new Subject<string>();

  driversLoading = false;
  drivers$: Observable<Object | any[]>;
  driversInput$ = new Subject<string>();

  agendasLoading = false;
  agendas$: Observable<Object | any[]>;
  agendasInput$ = new Subject<string>();

  constructor(private photoDialog: MatDialog,
    public dialogRef: MatDialogRef<AmaniDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    super();

    this.canEditFare = this.data.isSuperAdmin || this.authService.getFullName().includes('حسین الهی') || !this.data.isEdit;
    if (this.data.readOnly) {
      return;
    }

    // this.getReceivers();
    // this.getDrivers();
    // this.getTrailers();
    this.getReceivers();
    this.getcarTypes();
    this.getBranchs();
    this.loadDrivers();
    this.loadSenders();
    this.loadTrailers();
    this.loadAgendas();
  }

  ngOnInit(): void {
    this.CreateForm();
    this.formControlValueChanged();
  }

  private CreateForm() {
    this.form = this.fb.group(
      {
        bodyNumber: [this.data.Car.bodyNumber, Validators.required],
        agendaId: [this.data.Car.agendaId, Validators.required],
        exportDate: [
          moment(this.data.Car.exportDate).locale('fa'),
          Validators.required
        ],
        receiverId: [this.data.Car.receiverId, Validators.required],
        senderId: [this.data.Car.senderId, Validators.required],
        driverId: [this.data.Car.driverId, Validators.required],
        guiltyDriverId: [this.data.Car.guiltyDriverId],
        guiltyTrailerId: [this.data.Car.guiltyTrailerId],
        trailerId: [this.data.Car.trailerId],
        carTypeId: this.data.Car.carTypeId,
        fare: [this.data.Car.fare, { validators: [Validators.required], updateOn: 'change' }],
        sixth1: [this.data.Car.sixth1,{ updateOn: 'change' }],
        description: this.data.Car.description || '',
        issueLetterNo: this.data.Car.issueLetterNo || '',
        issueDate: moment(this.data.Car.issueDate).locale('fa'),
        isGhabel30: [this.data.Car.isGhabel30, Validators.required],
        branchId: this.data.Car.branchId,
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

  changeImageList(event) {
    this.fileNames = event;
    const images = this.fileNames;
    images.forEach(image => {
        if (!image['imagePath'])
            image['imagePath'] = 'http://127.0.0.1:8887/' + image['fileName'];
    })

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
      const carType = this.carTypes.find(function (obj) {
        return obj.alt === carTypeCode;
      });
      if (carType !== undefined && carType != null) {
        this.form.get('carTypeId').setValue(carType.id);
        // this.form.get('carType').setValue(+carType.id);
      }
    }
  }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }

  deleteFile(file) {
    const fileName = encodeURIComponent(file.fileName);
    const isTemporaryDelete = encodeURIComponent(true);
    const param = {
      fileName: file.fileName,
      isTempraryDelete : true
    }
    this.http
      .delete('/v1/api/Uploader/deleteFile'+`?fileName=${fileName}&isTemporaryDelete=${isTemporaryDelete}`)
      .subscribe((result) => (
        this.fileNames.forEach((i) => {
        if (i.fileName == file.fileName)
            this.fileNames.splice(i, 1);
        
        })));

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
  private loadAgendas() {
    this.agendas$ = concat(
      of([
        {
          id: this.data.Car.agendaId,
          title: this.data.Car.agendaTitle
        }
      ]),
      this.agendasInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.agendasLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/agendas/' + term + '/true').pipe(
            catchError(() => of([])),
            tap(() => (this.agendasLoading = false))
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
    const requstFiles= [{
      fileNames:this.fileNames.map(file => ( {fileName: file.fileName})),
      type:'test'}];
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
        AgendaId: this.form.get('agendaId').value,
        SenderId: this.form.get('senderId').value,
        DriverId: this.form.get('driverId').value,
        GuiltyDriverId: this.form.get('guiltyDriverId').value,
        GuiltyTrailerId: this.form.get('guiltyTrailerId').value,
        TrailerId: this.form.get('trailerId').value,
        CarTypeId: this.form.get('carTypeId').value,
        Fare: this.form.get('fare').value,
        Sixth1: this.form.get('sixth1').value,
        Description: this.form.get('description').value || '',
        IssueLetterNo: this.form.get('issueLetterNo').value || '',
        RequestFiles:requstFiles,
        IssueDate:
          this.form.get('issueDate').value != null
            ? moment
              .from(this.form.get('issueDate').value, 'en')
              .utc(true)
              .toJSON()
            : null,
        BranchId: this.form.get('branchId').value || 1,
        IsGhabel30: this.form.get('isGhabel30').value || 0
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

  getUrl() {
    return '/v1/api/Amani/';
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }
  openPhotoDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      tableId: this.data.Car.id,
      tableName: 'amani',
    }

    // this.dialog.open(Ng2FileUploadComponent, dialogConfig);
  }
  download() {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = this.getUrl();
    // this.http.get<any>(url + + 1, { headers: headers1 });
    this.http.get('/v1/api/photo/23', { headers: headers1 }).subscribe(result => {
      console.log(result);
    });
  }
}
