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
  selector: 'bill-dialog',
  templateUrl: 'bill.dialog.html',
  styles: [
    '.imagePlaceHolder {border:2px dotted blue;width: 200px;Height: 220px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ]
})
// tslint:disable-next-line: component-class-suffix
export class BillDialog extends ModalBaseClass implements OnInit {

  form: FormGroup;
  @ViewChild('issueDatePicker') issueDatePicker;

  branchs = [];
  constructor(
    public dialogRef: MatDialogRef<BillDialog>,
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
    this.form = this.fb.group(
      {
        billNo: [this.data.Bill.billNo, Validators.required],
        branchId: this.data.Bill.branchId,
        personName: this.data.Bill.personName,
        billMonth: this.data.Bill.billMonth,
        phoneNo: this.data.Bill.phoneNo,
        description: this.data.Bill.description,
        amount: [this.data.Bill.amount,  { validators: [Validators.required], updateOn: 'change' }],
        payDate: [moment(this.data.Bill.issueDate).locale('fa'),
        Validators.required
        ],
      },
      // { updateOn: 'blur' }
    );
    // this.form.get('amount').valueChanges.subscribe(() => console.log(this.form.get('amount').value));
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
      const bill = JSON.stringify({
        billNo: this.form.get('billNo').value,
        branchId: this.form.get('branchId').value,
        personName: this.form.get('personName').value,
        billMonth: this.form.get('billMonth').value,
        phoneNo: this.form.get('phoneNo').value,
        amount: this.form.get('amount').value,
        payDate: this.form.get('payDate').value,
        description: this.form.get('description').value
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getEntryPointUrl() + this.data.Bill.id, bill,
            { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit bill');
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
          billNo: this.form.get('billNo').value,
          branchId: this.form.get('branchId').value,
          personName: this.form.get('personName').value,
          billMonth: this.form.get('billMonth').value,
          phoneNo: this.form.get('phoneNo').value,
          amount: this.form.get('amount').value,
          payDate: this.form.get('payDate').value,
          description: this.form.get('description').value
        }),
        { headers: headers1 }
      )
      .subscribe(
        result => {
          this.dialogRef.close({ state: 'successful' });
        },
        (error: any) => {
          console.log('create bill');
          console.log(error);
        }
      );

  }

  getEntryPointUrl() {
    return '/v1/api/Bill/';
  }
}
