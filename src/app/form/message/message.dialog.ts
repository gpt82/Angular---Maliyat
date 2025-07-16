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
import { AuthService } from '../../core/services/app-auth-n.service';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'message-dialog',
  templateUrl: 'message.dialog.html',
  styles: [
    '.imagePlaceHolder {border:2px dotted blue;width: 200px;Height: 220px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ]
})
// tslint:disable-next-line: component-class-suffix
export class MessageDialog extends ModalBaseClass implements OnInit {

  form: FormGroup;
  @ViewChild('issueDatePicker') issueDatePicker;
  public people: any[];
  selesctedReciver;
  // personsLoading = false;
  // persons$: Observable<Object | any[]>;
  // personsInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<MessageDialog>,
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
    this.getPeople();
    this.form = this.fb.group(
      {
        senderId: this.data.Message.senderId,
        messageNo: [this.data.Message.messageNo, Validators.required],
        reciverIds: [this.data.Message.reciverIds?.split(',').map(x => +x), Validators.required],
        registeredDate: [moment(this.data.Message.registeredDate).locale('fa'),
        Validators.required
        ],
        description: [this.data.Message.description, Validators.required],
      },
      { updateOn: 'blur' }
    );
    // this.setdis();
  }
  getPeople(): void {
    this.http
      .get('/v1/api/Lookup/persons').subscribe((res: ILookupResultDto[]) => this.people = res);
  }
  setdis() {
    this.people.forEach(e => e.disabled = true);
    console.log(this.people);
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
  onChangeSelected(items: any) {
    this.selesctedReciver = items.map(i => i.title).join();
  }
  onSave(): void {
    if (this.form.valid) {
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });
      const message = JSON.stringify({
        MessageNo: this.form.get('messageNo').value,
        ReciverIds: this.form.get('reciverIds').value.join(),
        ReciversTitle: this.selesctedReciver,
        RegisteredDate: this.form.get('registeredDate').value,
        Description: this.form.get('description').value
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getEntryPointUrl() + this.data.Message.id, message,
            { headers: header })
          .subscribe(
            () => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit message');
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
          MessageNo: this.form.get('messageNo').value,
          ReciverIds: this.form.get('reciverIds').value.join(),
          ReciversTitle: this.selesctedReciver,
          RegisteredDate: this.form.get('registeredDate').value,
          Description: this.form.get('description').value
        }),
        { headers: headers1 }
      )
      .subscribe(
        () => {
          this.dialogRef.close({ state: 'successful' });
        },
        (error: any) => {
          console.log('create message');
          console.log(error);
        }
      );

  }

  getEntryPointUrl() {
    return '/v1/api/Message/';
  }
}
