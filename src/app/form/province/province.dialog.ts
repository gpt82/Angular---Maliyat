import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/app-auth-n.service';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'province-dialog',
  templateUrl: 'province.dialog.html',

})
// tslint:disable-next-line:component-class-suffix
export class ProvinceDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<ProvinceDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
    , private http: HttpClient,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService) {
    super();
  }
  ngOnInit() {
    this.form = this.fb.group({
      name: [this.data.Province.name, Validators.required],
      transTime: [this.data.City.transTime],
    });
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
        this.edit(this.data);
      } else {
        this.create(this.data);
      }
    }
  }
  edit(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.put(this.getUrl() + data.Province.id,
        JSON.stringify(
          {
            Type: 1,
            Name: this.form.get('name').value,
            TransTime: this.form.get('transTime').value,
            Code: data.Province.code
          }), { headers: headers1 }).subscribe((result) => {
            this.dialogRef.close({ state: 'successful' });
          }, (error: any) => {
            console.log('edit province');
            console.log(error);
          });
    }
  }
  create(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.post(this.getUrl(), JSON.stringify(
        {
          Type: 1,
          Name: this.form.get('name').value,
          TransTime: this.form.get('transTime').value,
          Code: this.form.get('name').value
        }), { headers: headers1 }).subscribe((result) => {
          this.dialogRef.close({ state: 'successful' });
        }, (error: any) => {
          console.log('create province');
          console.log(error);
        });
    }
  }
  getUrl() {
    return '/v1/api/gis/';
  }
}
