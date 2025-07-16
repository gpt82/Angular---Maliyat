import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'factory-fare-dialog',
  templateUrl: 'factory-fare.dialog.html',
})
// tslint:disable-next-line:component-class-suffix
export class FactoryFareDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;
  isSuperAdmin: boolean;
  branchs = [];
  provinces = [];

  constructor(
    public dialogRef: MatDialogRef<FactoryFareDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private authService: AuthService
  ) {
    super();
    this.getProvinces();
    this.getBranchs();
    this.isSuperAdmin = this.authService.hasRole(
      RolesConstants.SuperAdministrators
    );
  }

  ngOnInit() {
    this.form = this.fb.group(
      {
        fareGroup: this.fb.group(
          {
            contractNo: [this.data.factoryFare.contractNo, Validators.required],
            provinceId: [this.data.factoryFare.provinceId, { validators: [Validators.required], updateOn: 'change' }],
          }
          // { asyncValidators: this.uniqueFactoryFare.bind(this) }
        ), // , {validator: this.uniqueFare.bind(this)}
        branchId: this.data.factoryFare.branchId,
        provinceFare: [this.data.factoryFare.provinceFare || 0, Validators.required],
      },
      { updateOn: 'blur' }
    );
  }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }
  getProvinces(): void {
    this.http
      .get('/v1/api/Lookup/provinces')
      .subscribe((result: ILookupResultDto[]) => (this.provinces = result));
  }

  // uniqueFare(group: FormGroup): Observable<ValidationErrors | null> {
  //   const contractNo = group.controls['contractNo'];
  //   const provinceId = group.controls['provinceId'];
  //   // const BranchId = this.form.get('branchId').value || 0;
  //   const equalOriginal =
  //     provinceId.value === this.data.Fare.provinceId &&
  //     contractNo.value === this.data.Fare.contractNo;
  //   return equalOriginal
  //     ? of(null)
  //     : this.fareService.getFare(provinceId.value, contractNo.value).pipe(
  //       map(exist => {
  //         return exist ? { uniqueFare: true } : null;
  //       })
  //     );
  // }

  onClose(): void {
    if (!this.form.dirty) {
      this.dialogRef.close({ data: null, state: 'cancel' });
    } else {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '250px',
        data: { state: 'ok' },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.state === 'confirmed') {
          this.dialogRef.close({ data: null, state: 'cancel' });
        }
      });
    }
  }

  onSave(): void {
    if (this.form.valid) {
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });

      const factoryFare = JSON.stringify({
        ContractNo: this.form.get('fareGroup.contractNo').value,
        ProvinceId: this.form.get('fareGroup.provinceId').value,
        ProvinceFare: this.form.get('provinceFare').value || 0,
        BranchId: this.form.get('branchId').value || 0,
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getUrl() + this.data.factoryFare.id, factoryFare, {
            headers: header,
          })
          .subscribe(
            (result) => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit fare');
              console.log(error);
            }
          );
      } else {
        this.http
          .post(this.getUrl(), factoryFare, { headers: header })
          .subscribe(
            (result) => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('create factoryFare');
              console.log(error);
            }
          );
      }
    }
  }

  getUrl() {
    return '/v1/api/FactoryFare/';
  }
}
