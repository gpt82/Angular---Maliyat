import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CarGroupDto } from './dtos/CarGroupDto';
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

import { CarGroupService } from './car-group.service';
import { uniqueCarGroupNameValidator } from '../../shared/custom-validators/unique-car-group-name-validator.directive';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'car-group-dialog',
  templateUrl: 'car-group.dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class CarGroupDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CarGroupDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private carGroupService: CarGroupService,
    public authService: AuthService
  ) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group(
      {
        name: [
          this.data.CarGroup.name,
          Validators.required,
          this.uniqueName.bind(this)
        ],
        suv: this.data.CarGroup.suv
      },
      { updateOn: 'blur' }
    );

    if (this.data.isEdit === true) {
      this.form.patchValue({
        name: this.data.CarGroup.name
      });
    }
  }

  uniqueName(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    if (ctrl.value === this.data.CarGroup.name) {
      return of(null);
    }
    // const equalOriginal = ctrl.value === this.data.CarGroup.name;
    return this.carGroupService.getCarGroupByName(ctrl.value).pipe(
      map(names => {
        return names.entities.length > 0 ? { uniqueCarGroupName: true } : null;
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

      this.http
        .put(
          this.getUrl() + data.CarGroup.id,
          JSON.stringify({
            name: this.form.get('name').value,
            suv: this.form.get('suv').value
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('edit car group');
            console.log(error);
          }
        );
    }
  }

  create(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http
        .post(this.getUrl(), JSON.stringify(this.form.get('name').value), {
          headers: headers1
        })
        .subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('create car group');
            console.log(error);
          }
        );
    }
  }

  getUrl() {
    return '/v1/api/CarGroup/';
  }
}
