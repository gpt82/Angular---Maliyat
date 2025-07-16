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
  selector: 'truck-loan-dialog',
  templateUrl: 'truck-loan.dialog.html',
  styles: [
    '.imagePlaceHolder {border:2px dotted blue;width: 200px;Height: 220px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ]
})
// tslint:disable-next-line: component-class-suffix
export class TruckLoanDialog extends ModalBaseClass implements OnInit {

  form: FormGroup;
  @ViewChild('loanDatePicker') loanDatePicker;

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<TruckLoanDialog>,
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
    this.form = this.fb.group(
      {
        trailerId: this.data.TruckLoan.trailerId,
        borrower: this.data.TruckLoan.borrower,
        loanAmount: [this.data.TruckLoan.loanAmount, { validators: [Validators.required], updateOn: 'change' }],
        loanDate: [moment(this.data.TruckLoan.loanDate).locale('fa'),
        Validators.required
        ],
        monthlyPayment: [this.data.TruckLoan.monthlyPayment, { validators: [Validators.required], updateOn: 'change' }],
        loanTerm: [this.data.TruckLoan.loanTerm, { validators: [Validators.required], updateOn: 'change' }],
        interestRate: [this.data.TruckLoan.interestRate],
        description: [this.data.TruckLoan.description]
      },
      { updateOn: 'blur' }
    );

  }
  
  private loadTrailers() {
    this.trailers$ = concat(
      of([
        {
          id: this.data.TruckLoan.trailerId,
          title: this.data.TruckLoan.trailerPlaque
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
    this.loanDatePicker.open();
  }
  onSave(): void {
    if (this.form.valid) {
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });
      const truckLoan = JSON.stringify({
        LoanAmount: this.form.get('loanAmount').value,
        InterestRate: this.form.get('interestRate').value,
        MonthlyPayment: this.form.get('monthlyPayment').value,
        LoanTerm: this.form.get('loanTerm').value,
        LoanDate: this.form.get('loanDate').value,
        Description: this.form.get('description').value,
        TrailerId: this.form.get('trailerId').value,
        Borrower: this.form.get('borrower').value,
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getEntryPointUrl() + this.data.TruckLoan.id, truckLoan,
            { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit truck-loan');
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
          LoanAmount: this.form.get('loanAmount').value,
          MonthlyPayment: this.form.get('monthlyPayment').value,
          LoanTerm: this.form.get('loanTerm').value,
          InterestRate: this.form.get('interestRate').value,
          LoanDate: this.form.get('loanDate').value,
          Description: this.form.get('description').value,
          TrailerId: this.form.get('trailerId').value,
          Borrower: this.form.get('borrower').value,
        }),
        { headers: headers1 }
      )
      .subscribe(
        result => {
          this.dialogRef.close({ state: 'successful' });
        },
        (error: any) => {
          console.log('create truck-loan');
          console.log(error);
        }
      );
  }

  getEntryPointUrl() {
    return '/v1/api/TruckLoan/';
  }
}
