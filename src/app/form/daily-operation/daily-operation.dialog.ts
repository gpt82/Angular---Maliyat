import { Component, Inject, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import {  FormBuilder, FormGroup, Validators } from '@angular/forms';
import { concat, Observable, of, Subject } from 'rxjs';
import * as moment from 'jalali-moment';

import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap
} from 'rxjs/operators';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { AuthService } from '../../core/services/app-auth-n.service';


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'daily-operation-dialog',
  templateUrl: 'daily-operation.dialog.html',

})
// tslint:disable-next-line: component-class-suffix
export class DailyOperationDialog extends ModalBaseClass implements OnInit {

  form: FormGroup;
  @ViewChild('issueDatePicker') issueDatePicker;
  tonnageTypesLoading = false;
  tonnageTypes$: Observable<Object | any[]>;
  tonnageTypesInput$ = new Subject<string>();
 
  constructor(
    public dialogRef: MatDialogRef<DailyOperationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public authService: AuthService,
    private fb: FormBuilder,
    public dialog: MatDialog) {
    super();
  }

  ngOnInit() {
    this.CreateForm();
    this.loadTonnageTypes();
  }


  
  private CreateForm() {
    this.form = this.fb.group(
      {
        branchId: [this.data.dailyOperation.branchId],
        issueDate: [this.data.dailyOperation.issueDate],
        tonnageTypeId: [this.data.dailyOperation.tonnageTypeId, Validators.required],
        count: [this.data.dailyOperation.count, Validators.required],
      },
      { updateOn: 'blur' }
    );
  }

  popUpCalendar1() {
    this.issueDatePicker.open();
  }
  
  private loadTonnageTypes() {
    this.tonnageTypes$ = concat(
      of([
        {
          id: this.data.dailyOperation.tonnageTypeId,
          title: this.data.dailyOperation.tonnageTypeName
        }
      ]),
      this.tonnageTypesInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.tonnageTypesLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/tonnageTypes/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.tonnageTypesLoading = false))
          )
        )
      )
    );
  }

  getUrl(endPoint) {
    return endPoint;
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
    this.http.put(this.getEntryPointUrl() + this.data.dailyOperation.id,
      JSON.stringify({
        Id: this.data.dailyOperation.id,
        branchId: this.data.dailyOperation.branchId,
        issueDate:moment
        .from(this.form.get('issueDate').value, 'en')
        .utc(true)
        .toJSON(), 
        tonnageTypeId: this.form.get('tonnageTypeId').value,
        count: this.form.get('count').value,
      }), { headers: headers1 }).subscribe((result) => {
        this.dialogRef.close({ state: 'successful' });
      }, (error: any) => {
        console.log('edit dailyOperation');
        console.log(error);
      });
  }

  create(): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post(this.getEntryPointUrl(), JSON.stringify({
      branchId: this.authService.selectedBranchId,
      issueDate: moment
      .from(this.form.get('issueDate').value, 'en')
      .utc(true)
      .toJSON(), 
      tonnageTypeId: this.form.get('tonnageTypeId').value,
      count: this.form.get('count').value,
    }), { headers: headers1 }).subscribe((result) => {
      this.dialogRef.close({ state: 'successful' });
    }, (error: any) => {
      console.log('create dailyOperation');
      console.log(error);
    });

  }


  getEntryPointUrl() {
    return '/v1/api/dailyOperation/';
  }
}
