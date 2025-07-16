import {Component, Inject, OnInit} from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { HttpHeaders, HttpClient } from "@angular/common/http";
;
import { ConfirmDialog } from "../../shared/dialogs/Confirm/confirm.dialog";

import { ModalBaseClass } from "../../shared/services/modal-base-class";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {Observable, of} from "rxjs";
import {map} from "rxjs/operators";
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  selector: "car-Manufacturer-group-dialog",
  templateUrl: "car-Manufacturer-group.dialog.html"
})
export class CarManufacturerGroupDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CarManufacturerGroupDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public authService: AuthService) {
    super();
  }

  get name(){
    return this.form.get('name');
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required, this.uniqueName.bind(this)]
    },{updateOn: 'blur'});
    if (this.data.isEdit === true) {
      this.form.setValue({
        name: this.data.CarManufacturerGroup.name
      })
    }
  }
  uniqueName(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    let equalOriginal = ctrl.value == this.data.CarManufacturerGroup.name;

    if (equalOriginal) return of(null);

    return this.http.get<any>(`${this.getUrl()}Name/${ctrl.value}`).pipe(
      map(names => {
        return (names && names.entities.length > 0) && !equalOriginal ? {'uniqueName': true} : null
      })
    );
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
      if (this.data.isEdit === true) {
        this.edit(this.data);
      } else {
        this.create(this.data);
      }
    }
  }
  edit(data): void {
    if (data) {
      let headers1 = new HttpHeaders({ "Content-Type": "application/json" });
      this.http
        .put(
          this.getUrl() + data.CarManufacturerGroup.id,
          JSON.stringify({
            Name: this.name.value
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            this.dialogRef.close({ state: "successful" });
          },
          (error: any) => {
            console.log("create Car Manufacturer Group ");
            console.log(error);
          }
        );
    }
  }
  create(data): void {
    if (data) {
      let headers1 = new HttpHeaders({ "Content-Type": "application/json" });
      this.http
        .post(
          this.getUrl(),
          JSON.stringify({
            Name: this.name.value
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            this.dialogRef.close({ state: "successful" });
          },
          (error: any) => {
            console.log("create Car Manufacturer Group");
            console.log(error);
          }
        );
    }
  }

  getUrl() {
    return "/v1/api/CarManufacturerGroup/";
  }
}
