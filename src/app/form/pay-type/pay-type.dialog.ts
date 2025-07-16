import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/app-auth-n.service';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'pay-type-dialog',
  templateUrl: 'pay-type.dialog.html',

})
// tslint:disable-next-line: component-class-suffix
export class PayTypeDialog extends ModalBaseClass implements OnInit {

  constructor(public dialogRef: MatDialogRef<PayTypeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService) {
    super();
  }
  ngOnInit() {
    this.form = this.fb.group({
      name: [this.data.PayType.name, [Validators.required], this.uniqueName.bind(this)]
    }, { updateOn: 'blur' });
  }
  get name() {
    return this.form.get('name');
  }
  uniqueName(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    if (ctrl.value === this.data.PayType.name) {
      return of(null);
    }
    return this.http.get(this.getUrl() + 'PayType/' + ctrl.value).pipe(
      map(isExist => {
        return isExist ? { uniquePayTypeName: true } : null;
      })
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
        if (result.state == 'confirmed') {
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

      this.http.put(this.getUrl() + data.PayType.id, JSON.stringify(this.name.value), { headers: headers1 }).subscribe((result) => {
        this.dialogRef.close({ state: 'successful' });
      }, (error: any) => {
        console.log('edit pay type');
        console.log(error);
      });
    }
  }
  create(data): void {
    if (data) {

      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.post(this.getUrl(), JSON.stringify(this.name.value), { headers: headers1 }).subscribe((result) => {
        this.dialogRef.close({ state: 'successful' });
      }, (error: any) => {
        console.log('create pay type');
        console.log(error);
      });
    }
  }
  getUrl() {
    return '/v1/api/PayType/';
  }
}
