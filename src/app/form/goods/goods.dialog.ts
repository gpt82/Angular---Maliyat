import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/app-auth-n.service';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'goods-dialog',
  templateUrl: 'goods.dialog.html',

})
// tslint:disable-next-line:component-class-suffix
export class GoodsDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<GoodsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required, this.uniqueGoodsName.bind(this)],
      code: ['', Validators.required, this.uniqueGoodsCode.bind(this)]
    }, { updateOn: 'blur' });
    if (this.data.isEdit === true) {
      this.form.setValue({
        name: this.data.Goods.name,
        code: this.data.Goods.code
      });
    }
  }
  get code() {
    return this.form.get('code');
  }
  get name() {
    return this.form.get('name');
  }

  uniqueGoodsCode(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    const equalOriginal = ctrl.value === this.data.Goods.code;

    if (equalOriginal) { return of(null); }

    return this.http.get<any>(`${this.getEntryPointUrl()}Code/${ctrl.value}`).pipe(
      map(codes => {
        return (codes && codes.entities.length > 0) && !equalOriginal ? { 'uniqueCode': true } : null;
      })
    );
  }
  uniqueGoodsName(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    const equalOriginal = ctrl.value === this.data.Goods.name;

    if (equalOriginal) { return of(null); }

    return this.http.get<any>(`${this.getEntryPointUrl()}Name/${ctrl.value}`).pipe(
      map(names => {
        return (names && names.entities.length > 0) && !equalOriginal ? { 'uniqueName': true } : null;
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
  create(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.post(this.getEntryPointUrl(), JSON.stringify({
        Name: this.form.get('name').value,
        Code: this.form.get('code').value
      }), { headers: headers1 }).subscribe((result) => {
        this.dialogRef.close({ state: 'successful' });
      }, (error: any) => {
        console.log('create car type');
        console.log(error);
      });
    }
  }
  edit(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.put(this.getEntryPointUrl() + data.Goods.id,
        JSON.stringify({
          Name: this.form.get('name').value,
          Code: this.form.get('code').value
        }), { headers: headers1 }).subscribe((result) => {
          this.dialogRef.close({ state: 'successful' });
        }, (error: any) => {
          console.log('create car type');
          console.log(error);
        });
    }
  }

  getEntryPointUrl() {
    return '/v1/api/Goods/';
  }
}
