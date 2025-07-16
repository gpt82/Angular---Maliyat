import { Component, Inject, OnInit, ViewChild } from '@angular/core'
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import * as moment from 'jalali-moment'
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog'
import { ModalBaseClass } from '../../shared/services/modal-base-class'
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { concat, Observable, of, Subject } from 'rxjs'
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from 'rxjs/operators'
import { AuthService } from '../../core/services/app-auth-n.service'
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'warranty-dialog',
  templateUrl: 'warranty.dialog.html',
})
// tslint:disable-next-line:component-class-suffix
export class WarrantyDialog extends ModalBaseClass implements OnInit {
  form: FormGroup
  @ViewChild('picker') picker

  trailersLoading = false
  trailers$: Observable<Object | any[]>
  trailersInput$ = new Subject<string>()

  public personTypes: any[] = [
    { id: 1, label: 'راننده' },
    { id: 2, label: 'کارمند' },
    { id: 3, label: 'سایر' },
  ]
  public warrantyTypes: any[] = [
    { id: 1, label: 'سفته' },
    { id: 2, label: 'چک' },
    { id: 3, label: 'سایر' },
  ]

  constructor(
    public dialogRef: MatDialogRef<WarrantyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public authService: AuthService,
  ) {
    super()
    this.loadTrailers()
  }

  ngOnInit() {
    this.form = this.fb.group(
      {
        warrantyNumber: [
          this.data.Warranty.warrantyNumber,
          Validators.required,
          this.uniqueCode.bind(this),
        ],
        issueDate: [this.data.Warranty.issueDate, Validators.required],
        trailerId: [this.data.Warranty.trailerId],
        personTypeId: [this.data.Warranty.personTypeId, Validators.required],
        warrantyTypeId: [
          this.data.Warranty.warrantyTypeId,
          Validators.required,
        ],
        personName: [this.data.Warranty.personName, Validators.required],
        amount: [this.data.Warranty.amount, { validators: [Validators.required], updateOn: 'change' }],
        description: [this.data.Warranty.description],
      },
      { updateOn: 'blur' },
    )
  }
  get warrantyNumber() {
    return this.form.get('warrantyNumber')
  }
  get invoiceNumber() {
    return this.form.get('invoiceNumber')
  }
  popUpCalendar() {
    this.picker.open()
  }
  // popUpCalendar1() {
  //   this.picker1.open();
  // }

  private loadTrailers() {
    this.trailers$ = concat(
      of([
        {
          id: this.data.Warranty.trailerId,
          title: this.data.Warranty.trailerPlaque,
        },
      ]),
      this.trailersInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.trailersLoading = true)),
        switchMap((term) =>
          this.http.get('/v1/api/Lookup/trailers/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.trailersLoading = false)),
          ),
        ),
      ),
    )
  }

  uniqueCode(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    if (ctrl.value === this.data.Warranty.warrantyNumber) {
      return of(null)
    }
    return this.http.get('/v1/api/Warranty/Code/' + ctrl.value).pipe(
      map((codes) => {
        return codes ? { uniqueWarrantyCode: true } : null
      }),
    )
  }

  onClose(): void {
    if (!this.form.dirty) {
      this.dialogRef.close({ data: null, state: 'cancel' })
    } else {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '250px',
        data: { state: 'ok' },
      })

      dialogRef.afterClosed().subscribe((result) => {
        if (result.state === 'confirmed') {
          this.dialogRef.close({ data: null, state: 'cancel' })
        }
      })
    }
  }

  onSave(): void {
    if (this.form.valid) {
      const header = new HttpHeaders({ 'Content-Type': 'application/json' })

      const warranty = JSON.stringify({
        WarrantyNumber: this.form.get('warrantyNumber').value,
        IssueDate: moment
          .from(this.form.get('issueDate').value, 'en')
          .utc(true)
          .toJSON(),
        TrailerId: this.form.get('trailerId').value,
        PersonTypeId: this.form.get('personTypeId').value,
        WarrantyTypeId: this.form.get('warrantyTypeId').value,
        PersonName: this.form.get('personName').value,
        Amount: this.form.get('amount').value,
        Description: this.form.get('description').value,
      })
      if (this.data.isEdit === true) {
        this.http
          .put(this.getUrl() + this.data.Warranty.id, warranty, {
            headers: header,
          })
          .subscribe(
            (result) => {
              this.dialogRef.close({ state: 'successful' })
            },
            (error: any) => {
              console.log('edit warranty')
              console.log(error)
            },
          )
      } else {
        this.http.post(this.getUrl(), warranty, { headers: header }).subscribe(
          (result) => {
            this.dialogRef.close({ state: 'successful' })
          },
          (error: any) => {
            console.log('create warranty')
            console.log(error)
          },
        )
      }
    }
  }

  getUrl() {
    return '/v1/api/Warranty/'
  }
}
