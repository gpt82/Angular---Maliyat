import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as moment from "jalali-moment";
import { ConfirmDialog } from "../../shared/dialogs/Confirm/confirm.dialog";
import { ModalBaseClass } from "../../shared/services/modal-base-class";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../core/services/app-auth-n.service";

@Component({
  selector: "delivery-waybill-dialog",
  templateUrl: "delivery-waybill.dialog.html"
})
export class DeliveryWaybillDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DeliveryWaybillDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    super();
    if (!this.data.isEdit) {
      this.data.DeliveryWaybill.totalCount = 0;
      this.data.DeliveryWaybill.remaining = 0;
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      fromNumber: ['0', Validators.required],
      toNumber: ['0', Validators.required],
      series: ['', Validators.required],
      // deliveryDate: ['', Validators.required],
      totalCount: '0',
      remaining: '0'
    }, { updateOn: 'blur' });
    if (this.data.isEdit === true) {
      this.form.setValue({
        fromNumber: this.data.DeliveryWaybill.fromNumber,
        toNumber: this.data.DeliveryWaybill.toNumber,
        series: this.data.DeliveryWaybill.series,
        // deliveryDate: this.data.deliveryDate,
        totalCount: this.data.DeliveryWaybill.totalCount,
        remaining: this.data.DeliveryWaybill.remaining
      });
    }
  }

  getUrl(endPoint) {
    return endPoint;
  }

  fromToNumberChanged(): void {
    if (
      this.form.get('fromNumber').value &&
      this.form.get('toNumber').value
    )
      this.form.controls['totalCount'].setValue(Math.abs(this.form.get('toNumber').value -
        this.form.get('fromNumber').value));
    else if (this.data.DeliveryWaybill.toNumber)
      this.form.controls['totalCount'].setValue(this.form.get('toNumber').value);
    else if (this.data.DeliveryWaybill.fromNumber)
      this.form.controls['totalCount'].setValue(this.form.get('fromNumber').value);

    if (!this.data.isEdit)
      this.form.controls['remaining'].setValue(this.form.get('totalCount').value);
  }

  onClose(): void {
    if (!this.form.dirty) this.dialogRef.close({ data: null, state: "cancel" });
    else {
      let dialogRef = this.dialog.open(ConfirmDialog, {
        width: "250px",
        data: { state: "ok" }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.state == "confirmed")
          this.dialogRef.close({ data: null, state: "cancel" });
      });
    }
  }

  onSave(): void {
    if (this.form.valid) {
      let header = new HttpHeaders({ "Content-Type": "application/json" });

      let waybill = JSON.stringify({
        FromNumber: this.form.get('fromNumber').value,
        ToNumber: this.form.get('toNumber').value,
        Series: this.form.get('series').value,
        // DeliveryDate: this.form.get('deliveryDate').value,
        TotalCount: this.form.get('totalCount').value,
        Remaining: this.form.get('remaining').value,
        BranchId: this.authService.selectedBranchId
      });

      if (this.data.isEdit === true) {
        this.http
          .put(this.getEntryPointUrl() + this.data.DeliveryWaybill.id,
            waybill, {
            headers: header
          })
          .subscribe(
            () => {
              this.dialogRef.close({ state: "successful" });
            },
            (error: any) => {
              console.log("edit delivery way bill");
              console.log(error);
            }
          );
      } else {
        this.http
          .post(this.getEntryPointUrl(), waybill, { headers: header })
          .subscribe(
            () => {
              this.dialogRef.close({ state: "successful" });
            },
            (error: any) => {
              console.log("create delivery way bill");
              console.log(error);
            }
          );
      }
    }
  }

  getEntryPointUrl() {
    return "/v1/api/DeliveryWaybill/";
  }
}
