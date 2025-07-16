import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PackagingDto } from './dtos/PackagingDto';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/app-auth-n.service';
import { PackagingService } from './packaging.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'packaging-dialog',
  templateUrl: 'packaging.dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class PackagingDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<PackagingDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private packagingService: PackagingService,
    public authService: AuthService
  ) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group(
      {
        packagingName: [
          this.data.Packaging.packagingName,
          Validators.required,
          this.uniqueName.bind(this)
        ]
      },
      { updateOn: 'blur' }
    );

    if (this.data.isEdit === true) {
      this.form.patchValue({
        packagingName: this.data.Packaging.packagingName
      });
    }
  }

  uniqueName(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    if (ctrl.value === this.data.Packaging.packagingName) {
      return of(null);
    }
    // const equalOriginal = ctrl.value === this.data.Packaging.name;
    return this.packagingService.getPackagingByName(ctrl.value).pipe(
      map(names => {
        return names.entities.length > 0 ? { uniquePackagingName: true } : null;
      })
    );
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

      this.http
        .put(
          this.getUrl() + data.Packaging.packagingId,
          JSON.stringify({
            name: this.form.get('packagingName').value
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('edit packaging');
            console.log(error);
          }
        );
    }
  }

  create(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http
        .post(this.getUrl(), JSON.stringify(this.form.get('packagingName').value), {
          headers: headers1
        })
        .subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('create packaging');
            console.log(error);
          }
        );
    }
  }

  getUrl() {
    return '/v1/api/Packaging/';
  }
}
