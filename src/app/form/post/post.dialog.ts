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
  selector: 'post-dialog',
  templateUrl: 'post.dialog.html',
  styles: [
    '.imagePlaceHolder {border:2px dotted blue;width: 200px;Height: 220px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ]
})
// tslint:disable-next-line: component-class-suffix
export class PostDialog extends ModalBaseClass implements OnInit {

  form: FormGroup;
  @ViewChild('issueDatePicker') issueDatePicker;
  public persons: any[];

  // personsLoading = false;
  // persons$: Observable<Object | any[]>;
  // personsInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<PostDialog>,
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
    this.getPersons();
    this.form = this.fb.group(
      {
        registeredDate: [moment(this.data.Post.registeredDate).locale('fa'),
        Validators.required
        ],
        description: [this.data.Post.description, Validators.required]
      },
      { updateOn: 'blur' }
    );
  }
  getPersons(): void {
    this.http
      .get('/v1/api/Lookup/persons')
      .subscribe((result: ILookupResultDto[]) => (this.persons = result));
  }
  // private loadPersons() {
  //   this.persons$ = concat(
  //     of([
  //       {
  //         id: this.data.Post.personId,
  //         title: this.data.Post.personTitle
  //       }
  //     ]),
  //     this.personsInput$.pipe(
  //       debounceTime(400),
  //       distinctUntilChanged(),
  //       tap(() => (this.personsLoading = true)),
  //       switchMap(term =>
  //         this.http.get('/v1/api/Lookup/persons/' + term).pipe(
  //           catchError(() => of([])),
  //           tap(() => (this.personsLoading = false))
  //         )
  //       )
  //     )
  //   );
  // }

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
      const post = JSON.stringify({
        // PostNo: this.form.get('postNo').value,
        // Amount: this.form.get('amount').value,
        RegisteredDate: this.form.get('registeredDate').value,
        // IssueLetterDate: this.form.get('issueLetterDate').value,
        // IssueLetterNo: this.form.get('issueLetterNo').value,
        Description: this.form.get('description').value,
        // PersonId: this.form.get('personId').value,
        // IsPost: this.form.get('isPost').value,
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getEntryPointUrl() + this.data.Post.id, post,
            { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit post');
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
          // PostNo: this.form.get('postNo').value,
          // Amount: this.form.get('amount').value,
          RegisteredDate: this.form.get('registeredDate').value,
          // IssueLetterDate: this.form.get('issueLetterDate').value,
          // IssueLetterNo: this.form.get('issueLetterNo').value,
          Description: this.form.get('description').value,
          // PersonId: this.form.get('personId').value,
          // IsPost: this.form.get('isPost').value,
        }),
        { headers: headers1 }
      )
      .subscribe(
        result => {
          this.dialogRef.close({ state: 'successful' });
        },
        (error: any) => {
          console.log('create post');
          console.log(error);
        }
      );

  }

  getEntryPointUrl() {
    return '/v1/api/Post/';
  }
}
