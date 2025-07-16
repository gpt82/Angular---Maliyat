import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
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
  selector: 'kaf-rent-paid-dialog',
  templateUrl: 'kaf-rent-paid.dialog.html',
  styles: [
    '.imagePlaceHolder {border:2px dotted blue;width: 200px;Height: 220px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ]
})
// tslint:disable-next-line: component-class-suffix
export class KafRentPaidDialog extends ModalBaseClass implements OnInit {

  form: FormGroup;
  @ViewChild('issueDatePicker') issueDatePicker;

  kafsLoading = false;
  kafs$: Observable<Object | any[]>;
  kafsInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<KafRentPaidDialog>,
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

    this.loadKafs();
    this.form = this.fb.group(
      {
        kafId: this.data.KafRentPaid.kafId,
        // driverId: this.data.KafRentPaid.driverId,
        rent: [this.data.KafRentPaid.rent, { validators: [Validators.required], updateOn: 'change' }],
        // issueDate: [moment(this.data.KafRentPaid.issueDate).locale('fa'),
        // Validators.required
        // ],
        forMonth: [this.data.KafRentPaid.forMonth, Validators.required]
      },
      { updateOn: 'blur' }
    );

  }

  private loadKafs() {
    this.kafs$ = concat(
      of([
        {
          id: this.data.KafRentPaid.kafId,
          title: this.data.KafRentPaid.trailerPlaque
        }
      ]),
      this.kafsInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.kafsLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/kafs/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.kafsLoading = false))
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

  onSave(): void {
    if (this.form.valid) {
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });
      const kafRentPaid = JSON.stringify({
        KafId: this.form.get('kafId').value,
        Rent: this.form.get('rent').value,
        ForMonth: this.form.get('forMonth').value,
        // Description: this.form.get('description').value,
        // KafId: this.form.get('kafId').value,
        // DriverId: this.form.get('driverId').value
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getEntryPointUrl() + this.data.KafRentPaid.id, kafRentPaid,
            { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit kaf-rent-paid');
              console.log(error);
            }
          );
      } else {
        this.http
          .post(
            this.getEntryPointUrl(), kafRentPaid, { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('create kaf-rent-paid');
              console.log(error);
            }
          );
      }
    }
  }

  // edit(): void {
  //   const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
  // }

  // create(): void {
  //   const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   this.http
  //     .post(
  //       this.getEntryPointUrl(),
  //       JSON.stringify({
  //         Amount: this.form.get('amount').value,
  //         IssueDate: this.form.get('issueDate').value,
  //         Description: this.form.get('description').value,
  //         KafId: this.form.get('kafId').value,
  //         DriverId: this.form.get('driverId').value
  //       }),
  //       { headers: headers1 }
  //     )
  //     .subscribe(
  //       result => {
  //         this.dialogRef.close({ state: 'successful' });
  //       },
  //       (error: any) => {
  //         console.log('create kaf-rent-paid');
  //         console.log(error);
  //       }
  //     );

  // }

  getEntryPointUrl() {
    return '/v1/api/KafRentPaid/';
  }
}
