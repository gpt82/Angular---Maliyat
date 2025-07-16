import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';

import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'Bank-dialog',
  templateUrl: 'bank.dialog.html',

})
// tslint:disable-next-line: component-class-suffix
export class BankDialog extends ModalBaseClass implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<BankDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService) {
    super();

  }
  ngOnInit() {
    this.CreateForm();
  }
  private CreateForm() {
    this.form = this.fb.group(
      {
        name: [this.data.bank.name, Validators.required],
        code: [this.data.bank.code, Validators.required],
        address: [this.data.bank.address],
      },
      { updateOn: 'blur' }
    );
  }
  onClose(): void {
    if (!this.form.dirty) {
      this.dialogRef.close({ data: null, state: 'cancel' });
    } else {
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
      if (this.data.isEdit === true) {
        this.edit();
      } else {
        this.create();
      }
    }
  }

  edit(): void {
    if (this.form.valid) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.put(this.getUrl() + this.data.bank.id,
        JSON.stringify({
          Code: this.form.get('code').value,
          Name: this.form.get('name').value,
          Address: this.form.get('address').value
        }), { headers: headers1 }).subscribe((result) => {
          this.dialogRef.close({ state: 'successful' });
        }, (error: any) => {
          console.log('edit Bank');
          console.log(error);
        });
    }
  }
  create(): void {
    if (this.form.valid) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.post(this.getUrl(), JSON.stringify({
        Code: this.form.get('code').value,
        Name: this.form.get('name').value,
        Address: this.form.get('address').value
      }), { headers: headers1 }).subscribe((result) => {
        this.dialogRef.close({ state: 'successful' });
      }, (error: any) => {
        console.log('create Bank');
        console.log(error);
      });
    }
  }

  getUrl() {
    return '/v1/api/Bank/';
  }
}
