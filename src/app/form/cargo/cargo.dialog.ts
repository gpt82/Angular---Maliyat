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
  selector: 'cargo-dialog',
  templateUrl: 'cargo.dialog.html',
  styles: [
    '.imagePlaceHolder {border:2px dotted blue;width: 200px;Height: 220px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ]
})
// tslint:disable-next-line: component-class-suffix
export class CargoDialog extends ModalBaseClass implements OnInit {

  form: FormGroup;
  @ViewChild('issueDatePicker') issueDatePicker;
  agendasLoading = false;
  agendas$: Observable<Object | any[]>;
  agendasInput$ = new Subject<string>();
  branchs = [];
  constructor(
    public dialogRef: MatDialogRef<CargoDialog>,
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
    this.form = this.fb.group(
      {
        // agendaId: [this.data.Cargo.cargoNo, Validators.required],
        agendaId: this.data.Cargo.agendaId,
        // personName: this.data.Cargo.personName,
        // cargoMonth: this.data.Cargo.cargoMonth,
        // phoneNo: this.data.Cargo.phoneNo,
        // description: this.data.Cargo.description,
        // amount: [this.data.Cargo.amount,  { validators: [Validators.required], updateOn: 'change' }],
        // payDate: [moment(this.data.Cargo.issueDate).locale('fa'),    Validators.required     ],
      },
      // { updateOn: 'blur' }
    );
    // this.form.get('amount').valueChanges.subscribe(() => console.log(this.form.get('amount').value));
  }
  private loadAgendas() {
    this.agendas$ = concat(
      of([
        {
          id: this.data.Cargo.agendaId,
          title: this.data.Cargo.agendaTitle
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
  getBranchs(): void {

    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }

  getUrl(endPoint) {
    return endPoint;
  }
  // onKeypressEvent(event: any){
  //   this.form.get('amount').patchValue(event.target.value);
  //   console.log(event.target.value);

  // }
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
      const cargo = JSON.stringify({
        agendaId: this.form.get('agendaId').value,
        // branchId: this.form.get('branchId').value,
        // personName: this.form.get('personName').value,
        // cargoMonth: this.form.get('cargoMonth').value,
        // phoneNo: this.form.get('phoneNo').value,
        // amount: this.form.get('amount').value,
        // payDate: this.form.get('payDate').value,
        // description: this.form.get('description').value
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getEntryPointUrl() + this.data.Cargo.id, cargo,
            { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit cargo');
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
          agendaId: this.form.get('agendaId').value,
          // branchId: this.form.get('branchId').value,
          // personName: this.form.get('personName').value,
          // cargoMonth: this.form.get('cargoMonth').value,
          // phoneNo: this.form.get('phoneNo').value,
          // amount: this.form.get('amount').value,
          // payDate: this.form.get('payDate').value,
          // description: this.form.get('description').value
        }),
        { headers: headers1 }
      )
      .subscribe(
        result => {
          this.dialogRef.close({ state: 'successful' });
        },
        (error: any) => {
          console.log('create cargo');
          console.log(error);
        }
      );

  }

  getEntryPointUrl() {
    return '/v1/api/Cargo/';
  }
}
