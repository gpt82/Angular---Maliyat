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
import { AgendaDetailDto } from '../agenda/dtos/AgendaDetailDto';
import { AgendaDialog } from '../agenda/agenda.dialog';
import { ModalCordinate } from '../../shared/dtos/ModalCordinate';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'replace-trailer-dialog',
  templateUrl: 'replace-trailer.dialog.html',
  styles: [
    '.imagePlaceHolder {border:2px dotted blue;width: 200px;Height: 220px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ]
})
// tslint:disable-next-line: component-class-suffix
export class ReplaceTrailerDialog extends ModalBaseClass implements OnInit {
  modalCordinate: ModalCordinate = new ModalCordinate(0, 0);
  form: FormGroup;
  @ViewChild('issueDatePicker') issueDatePicker;

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  driversLoading = false;
  drivers$: Observable<Object | any[]>;
  driversInput$ = new Subject<string>();

  agendasLoading = false;
  agendas$: Observable<Object | any[]>;
  agendasInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<ReplaceTrailerDialog>,
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

    this.loadAgendas();
    this.loadTrailers();
    this.loadDrivers();
    this.form = this.fb.group(
      {
        agendaId: [this.data.ReplaceTrailer.agendaId, Validators.required],
        trailerId: this.data.ReplaceTrailer.trailerId,
        driverId: this.data.ReplaceTrailer.driverId,
        amount: [this.data.ReplaceTrailer.amount,  { validators: [Validators.required], updateOn: 'change' }],
        preFare: [this.data.ReplaceTrailer.preFare,  { validators: [Validators.required], updateOn: 'change' }],
        alternateAgendaNo: [this.data.ReplaceTrailer.alternateAgendaNo, Validators.required],
        issueDate: [moment(this.data.ReplaceTrailer.issueDate).locale('fa'),
        Validators.required
        ],
        description: [this.data.ReplaceTrailer.description, Validators.required]
      },
      // { updateOn: 'blur' }
    );
    // this.form.get('amount').valueChanges.subscribe(() => console.log(this.form.get('amount').value));
  }
  private loadAgendas() {
    this.agendas$ = concat(
      of([
        {
          id: this.data.ReplaceTrailer.agendaId,
          title: this.data.ReplaceTrailer.agendaNumber
        }
      ]),
      this.agendasInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.agendasLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/agendas/' + term + '/false').pipe(
            catchError(() => of([])),
            tap(() => (this.agendasLoading = false))
          )
        )
      )
    );
  }
  private loadDrivers() {
    this.drivers$ = concat(
      of([
        {
          id: this.data.ReplaceTrailer.driverId,
          title: this.data.ReplaceTrailer.driverName
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
          id: this.data.ReplaceTrailer.trailerId,
          title: this.data.ReplaceTrailer.trailerPlaque
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
  onShowAgenda(): void {
    const headers1 = new HttpHeaders({ "Content-Type": "application/json" });
    const id = this.form.get('agendaId').value;
    this.http.get('/v1/api/Agenda/' + id, { headers: headers1 }).subscribe(result => {
      const agenda = new AgendaDetailDto(result['entity']);
      const dialogRef = this.dialog.open(AgendaDialog, {
        width: '1000px',
        height: '510px',
        disableClose: true,
        data: {
          datePickerConfig: {
            drops: 'down',
            format: 'YY/M/D  ساعت  HH:mm',
            showGoToCurrent: 'true'
          },
          Agenda: agenda,
          exportDate: moment(agenda.exportDate).locale('fa'),
          dialogTitle: 'ویرایش ',
          isEdit: true,
          readOnly: true
        }
      });
      dialogRef.afterClosed().subscribe(result1 => {
        if (result1 && result1.state === 'successful') {
          // if (result1.showAddCarToAgendaForm) {
          //   const obj = Object.create({
          //     waybillNumber: result1.waybillNumber,
          //     waybillSeries: result1.waybillSeries,
          //     id: result1.id
          //   });
          //   this.onList(obj);
          // } else {
          //   this.fillGrid();
          //   this.resetSelectedRowIds();
          // }
        }
      });
    });
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
      const replaceTrailer = JSON.stringify({
        AgendaId: this.data.ReplaceTrailer.agendaId,
        Amount: this.form.get('amount').value,
        PreFare: this.form.get('preFare').value,
        AlternateAgendaNo: this.form.get('alternateAgendaNo').value,
        IssueDate: this.form.get('issueDate').value,
        Description: this.form.get('description').value,
        TrailerId: this.form.get('trailerId').value,
        DriverId: this.form.get('driverId').value
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getEntryPointUrl() + this.data.ReplaceTrailer.id, replaceTrailer,
            { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit replace-trailer');
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
          AgendaId: this.form.get('agendaId').value,
          Amount: this.form.get('amount').value, PreFare: this.form.get('preFare').value,
          AlternateAgendaNo: this.form.get('alternateAgendaNo').value,
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
          console.log('create replace-trailer');
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
    return '/v1/api/ReplaceTrailer/';
  }
}
