import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'branch-dialog',
  templateUrl: 'branch.dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class BranchDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<BranchDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group(
      {
        name: this.data.Branch.name,
        manufacturerName: this.data.Branch.manufacturer.title,
        cityName: this.data.Branch.city.title,
        provinceName: this.data.Branch.province.title,
        totalAccount: this.data.Branch.totalAccount,
        moeenAccount: this.data.Branch.moeenAccount,
        markaz: this.data.Branch.markaz,
        project: this.data.Branch.project,
        manager: this.data.Branch.manager,
        fareContract: this.data.Branch.fareContract,
        maxPreFare40: this.data.Branch.maxPreFare40,
        preFarePercent: this.data.Branch.preFarePercent,
        totalFarePercent: this.data.Branch.totalFarePercent,
        rewardPercent: this.data.Branch.rewardPercent,
        phone1: this.data.Branch.phone1,
        phone2: this.data.Branch.phone2,
        address: this.data.Branch.address,
        maxFare: this.data.Branch.maxFare,
      },
      { updateOn: 'blur' }
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
  getBranchCommandPOJO() {
    return {

      Manager: this.data.Branch.manager,
      MaxPreFare40: this.form.get('maxPreFare40').value,
      PreFarePercent: this.form.get('preFarePercent').value,
      TotalFarePercent: this.form.get('totalFarePercent').value,
      RewardPercent: this.form.get('rewardPercent').value,
      Phone1: this.form.get('phone1').value,
      Phone2: this.form.get('phone2').value,
      Address: this.form.get('address').value,
      FareContract: this.form.get('fareContract').value,
      TotalAccount: this.form.get('totalAccount').value,
      MoeenAccount: this.form.get('moeenAccount').value,
      Markaz: this.form.get('markaz').value,
      Project: this.form.get('project').value,
      MaxFare: this.form.get('maxFare').value,
    };
  }

  onSave(): void {
    if (this.form.valid) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      if (this.data.isEdit === true) {
        this.http
          .put(
            this.getUrl() + this.data.Branch.id,
            JSON.stringify(this.getBranchCommandPOJO()),
            {
              headers: headers1
            }
          )
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('create Branch', error);
            }
          );
      } else {
        this.http
          .post(this.getUrl(), JSON.stringify(this.getBranchCommandPOJO()), {
            headers: headers1
          })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('create Branch', error);
            }
          );
      }
    }
  }

  getUrl() {
    return '/v1/api/Branch/';
  }
}
