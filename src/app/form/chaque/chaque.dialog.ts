import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from 'jalali-moment';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { concat, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap
} from 'rxjs/operators';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'chaque-dialog',
  templateUrl: 'chaque.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class ChaqueDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;
  @ViewChild('picker') picker;
  @ViewChild('picker1') picker1;

  invoicesLoading = false;
  invoices$: Observable<Object | any[]>;
  invoicesInput$ = new Subject<string>();

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  driversLoading = false;
  drivers$: Observable<Object | any[]>;
  driversInput$ = new Subject<string>();

  banks = [];
  constructor(
    public dialogRef: MatDialogRef<ChaqueDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public authService: AuthService
  ) {
    super();
    this.loadDrivers();
    this.loadTrailers();
    this.getBanks();
  }

  ngOnInit() {
    this.form = this.fb.group(
      {
        chaqueNumber: [this.data.Chaque.chaqueNumber, Validators.required, this.uniqueCode.bind(this)],
        issueDate: [this.data.Chaque.issueDate, Validators.required],
        dueDate: [this.data.Chaque.dueDate, Validators.required],
        trailerId: [this.data.Chaque.trailerId, Validators.required],
        driverId: [this.data.Chaque.driverId, Validators.required],
        // invoiceId: [this.data.Chaque.invoiceId],
        invoiceNumber: [this.data.Chaque.invoiceNumber, Validators.required, this.ExistInvoiceNumber.bind(this)],
        bankId: [this.data.Chaque.bankId],
        amount: [this.data.Chaque.amount],
        description: [this.data.Chaque.description],
      },
      { updateOn: 'blur' }
    );
  }
  get chaqueNumber() {
    return this.form.get('chaqueNumber');
  }
  get invoiceNumber() {
    return this.form.get('invoiceNumber');
  }
  popUpCalendar() {
    this.picker.open();
  }
  popUpCalendar1() {
    this.picker1.open();
  }
  getBanks(): void {
    this.http
      .get('/v1/api/Lookup/banks')
      .subscribe((result: ILookupResultDto[]) => (this.banks = result));
  }
  private loadDrivers() {
    this.drivers$ = concat(
      of([
        {
          id: this.data.Chaque.driverId,
          title: this.data.Chaque.driverName
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
          id: this.data.Chaque.trailerId,
          title: this.data.Chaque.trailerPlaque
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

  uniqueCode(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    if (ctrl.value === this.data.Chaque.chaqueNumber) { return of(null); }
    return this.http.get('/v1/api/Chaque/Code/' + ctrl.value).pipe(
      map(codes => {
        return codes ? { uniqueChaqueCode: true } : null;
      })
    );
  }

  // uniqueCode2(): AsyncValidatorFn {
  //   return (
  //     control: AbstractControl
  //   ):
  //     | Promise<ValidationErrors | null>
  //     | Observable<ValidationErrors | null> => {
  //     if (control.value === this.data.Chaque.code) {
  //       return of(null);
  //     } else {
  //       return this._chaqueService.getChaqueByCode(control.value).pipe(
  //         map(codes => {
  //           return codes ? { uniqueChaqueCode: true } : null;
  //         })
  //       );
  //     }
  //   };
  // }

  // OnNgSelectKeyDown(event: any, type: string) {
  //   if (event.code === 'Escape') {
  //     event.stopPropagation();
  //     event.preventDefault();
  //   }
  // }
  ExistInvoiceNumber(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    if (ctrl.value === this.data.Chaque.invoiceNumber) { return of(null); }
    // const equalOriginal = ctrl.value === this.data.InvoiceNumber;
    return this.http.get('/v1/api/Invoice/invoiceNumber/' + ctrl.value).pipe(
      map(codes => {
        return codes ? null : { ExistInvoiceNumber: true };
      })
    );
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

  onSave(): void {
    if (this.form.valid) {
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });

      const chaque = JSON.stringify({
        ChaqueNumber: this.form.get('chaqueNumber').value,
        IssueDate: moment.from(this.form.get('issueDate').value, 'en')
          .utc(true).toJSON(),
        DueDate: moment.from(this.form.get('dueDate').value, 'en')
          .utc(true).toJSON(),
        TrailerId: this.form.get('trailerId').value,
        DriverId: this.form.get('driverId').value,
        InvoiceNumber: this.form.get('invoiceNumber').value,
        BankId: this.form.get('bankId').value,
        Amount: this.form.get('amount').value,
        Description: this.form.get('description').value,
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getUrl() + this.data.Chaque.id, chaque, { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit chaque');
              console.log(error);
            }
          );
      } else {
        this.http.post(this.getUrl(), chaque, { headers: header }).subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('create chaque');
            console.log(error);
          }
        );
      }
    }
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
  getUrl() {
    return '/v1/api/Chaque/';
  }
}
