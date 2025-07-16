import {Component, Inject, HostListener, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {ConfirmDialog} from '../../shared/dialogs/Confirm/confirm.dialog';
import {ModalBaseClass} from '../../shared/services/modal-base-class';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import { AuthService } from '../../core/services/app-auth-n.service';

import { DatePipe } from '@angular/common';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'tonnage-type-dialog',
  templateUrl: 'tonnage-type.dialog.html',
  providers: [DatePipe]

})
// tslint:disable-next-line: component-class-suffix
export class TonnageTypeDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;

  public myDate: Date = new Date(2023, 2, 6);

  constructor(
    public dialogRef: MatDialogRef<TonnageTypeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any, private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public authService: AuthService) {
    super();
  }

  get name() {
    return this.form.get('name');
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required, this.uniqueName.bind(this)],
      maxCapacity: '',
      minCapacity: ''
    }, {updateOn: 'blur'});

    if (this.data.isEdit === true) {
      this.form.setValue({
        name: this.data.TonnageType.name,
        maxCapacity: this.data.TonnageType.maxCapacity,
        minCapacity: this.data.TonnageType.minCapacity
      });
    }
  }

  uniqueName(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    const equalOriginal = ctrl.value === this.data.TonnageType.name;

    if (equalOriginal) { return of(null); }

    return this.http.get<any>(`${this.getUrl()}Name/${ctrl.value}`).pipe(
      map(names => {
        return (names && names.entities.length > 0) && !equalOriginal ? {'uniqueName': true} : null;
      })
    );
  }

  onClose(): void {
    if (!this.form.dirty) {
      this.dialogRef.close({data: null, state: 'cancel'});
    } else {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '250px',
        data: {state: 'ok'}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.state === 'confirmed') {
          this.dialogRef.close({data: null, state: 'cancel'});
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
      const headers1 = new HttpHeaders({'Content-Type': 'application/json'});
      this.http.post(this.getUrl(), JSON.stringify({
        Name: this.form.get('name').value,
        MaxCapacity: this.form.get('maxCapacity').value,
        MinCapacity: this.form.get('minCapacity').value
      }), {headers: headers1}).subscribe((result) => {
        this.dialogRef.close({state: 'successful'});
      }, (error: any) => {
        console.log('create tonnage type');
        console.log(error);
      });
    }
  }

  edit(data): void {
    if (data) {
      const headers1 = new HttpHeaders({'Content-Type': 'application/json'});
      this.http.put(this.getUrl() + data.TonnageType.id,
        JSON.stringify({
          Name: this.form.get('name').value,
          MaxCapacity: this.form.get('maxCapacity').value,
          MinCapacity: this.form.get('minCapacity').value
        }), {headers: headers1}).subscribe((result) => {
        this.dialogRef.close({state: 'successful'});
      }, (error: any) => {
        console.log('edit tonnage type');
        console.log(error);
      });
    }
  }

  getUrl() {
    return '/v1/api/TonnageType/';
  }
}
