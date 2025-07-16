import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { concat, Observable, of, Subject } from 'rxjs';
import { isShebaValid, verifyCardNumber, getBankNameFromCardNumber } from "@persian-tools/persian-tools";

import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap
} from 'rxjs/operators';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'bank-account-dialog',
  templateUrl: 'bank-account.dialog.html',

})
// tslint:disable-next-line: component-class-suffix
export class BankAccountDialog extends ModalBaseClass implements OnInit {

  bankNames = [];


  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<BankAccountDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialog: MatDialog) {
    super();
  }

  ngOnInit() {
    this.CreateForm();
    this.getBanks();
    this.loadTrailers();
  }
  private CreateForm() {
    this.form = this.fb.group(
      {
        bankId: [this.data.bankAccount.bankId, Validators.required],
        trailerId: [this.data.bankAccount.trailerId, Validators.required],
        name: [this.data.bankAccount.name],
        accNumber: [this.data.bankAccount.accNumber],
        accCardNumber: [this.data.bankAccount.accCardNumber, this.checkCardNumber()],
        accShaba: [this.data.bankAccount.accShaba, this.checkShaba()],
        isActive:this.data.bankAccount.isActive
        // description: [this.data.bankAccount.description],
      },
      { updateOn: 'blur' }
    );
  }
  getBanks(): void {
    this.http.get('/v1/api/Lookup/banks').subscribe((result: ILookupResultDto[]) => this.bankNames = result);
  }
  private loadTrailers() {
    this.trailers$ = concat(
      of([
        {
          id: this.data.bankAccount.trailerId,
          title: this.data.bankAccount.trailerPlaque
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
  checkShaba(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {

      const value = control.value;

      if (!value || value === this.data.bankAccount.accShaba) {
        return null;
      }
      const v =isShebaValid(value);
      return !isShebaValid(value) ? { validShaba: true } : null;
    }
  }

  checkCardNumber(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {

      const value = control.value;

      if (!value || value === this.data.bankAccount.AccCardNumber) {
        return null;
      }
      return !verifyCardNumber(value) ? { validCardNumber: true } : null;
    }
  }
  onClose(): void {
    if (!this.form.dirty) {
      this.dialogRef.close({ data: null, state: "cancel" });
    }
    else {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '250px',
        data: { state: 'ok' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.state == 'confirmed') {
          this.dialogRef.close({ data: null, state: "cancel" });
        }
      });
    }
  }

  onSave(): void {
    if (this.form.valid) {
      if (this.data.isEdit === true) {
        this.edit();
      } else {
        this.create();
      }
    }
  }

  edit(): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.put(this.getEntryPointUrl() + this.data.bankAccount.id,
      JSON.stringify({
        Id: this.data.bankAccount.id,
        AccNumber: this.form.get('accNumber').value,
        AccCardNumber: this.form.get('accCardNumber').value,
        AccShaba: this.form.get('accShaba').value,
        IsActive: this.form.get('isActive').value,
        Name: this.form.get('name').value,
        BankId: this.form.get('bankId').value,
        TrailerId: this.form.get('trailerId').value,
        // Description: this.form.get('description').value,
      }), { headers: headers1 }).subscribe((result) => {
        this.dialogRef.close({ state: 'successful' });
      }, (error: any) => {
        console.log('edit bankAccount');
        console.log(error);
      });
  }

  create(): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post(this.getEntryPointUrl(), JSON.stringify({
      AccNumber: this.form.get('accNumber').value,
      AccCardNumber: this.form.get('accCardNumber').value,
      AccShaba: this.form.get('accShaba').value,
      IsActive: this.form.get('isActive').value,
      Name: this.form.get('name').value,
      BankId: this.form.get('bankId').value,
      TrailerId: this.form.get('trailerId').value,
    }), { headers: headers1 }).subscribe((result) => {
      this.dialogRef.close({ state: 'successful' });
    }, (error: any) => {
      console.log('create bankAccount');
      console.log(error);
    });

  }


  getEntryPointUrl() {
    return '/v1/api/bankAccount/';
  }
}
