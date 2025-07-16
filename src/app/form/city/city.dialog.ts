import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ProvinceDto } from '../province/dtos/ProvinceDto';
import { DualViewModelDto } from '../../shared/dtos/DualViewModelDto';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import {ILookupResultDto} from "@shared/dtos/LookupResultDto";
import { AuthService } from '../../core/services/app-auth-n.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'city-dialog',
  templateUrl: 'city.dialog.html',

})
export class CityDialog extends ModalBaseClass {
  form: FormGroup;
  provinces = [];
  provinceControl = new FormControl();
  provinceFilterOptions: Observable<ProvinceDto[]>;
  provinceDto = new DualViewModelDto(this.data.City ? this.data.City.parrentId : null,
    this.data.City ? this.data.City.parrent : '');

  constructor(
    public dialogRef: MatDialogRef<CityDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService) {
    super();
  }
  ngOnInit() {
    this.form = this.fb.group({
      name: [this.data.City.name, Validators.required],
      transTime: [this.data.City.transTime],
      provinceId: this.data.City.parrentId
    }, { updateOn: 'blur' });
    this.getProvinces();
  }
  getProvinces(): void {
    this.http
      .get('/v1/api/Lookup/provinces')
      .subscribe((result: ILookupResultDto[]) => (this.provinces = result));
  }

  getUrl(endPoint) {
    return endPoint;
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
      this.http.put(this.getEntryPointUrl() + data.City.id,
        JSON.stringify(
          {
            Type: 2,
            Name: this.form.get('name').value,
            TransTime: this.form.get('transTime').value,
            Code: data.City.code,
            ParrentId: this.form.get('provinceId').value
          }), { headers: headers1 }).subscribe((result) => {
            this.dialogRef.close({ state: 'successful' });
          }, (error: any) => {
            console.log('create city');
            console.log(error);
          });
    }
  }
  create(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.post(this.getEntryPointUrl(), JSON.stringify(
        {
          Type: 2,
          Name: this.form.get('name').value,
          Code: this.form.get('name').value,
          TransTime: this.form.get('transTime').value,
          ParrentId: this.form.get('provinceId').value
        }), { headers: headers1 }).subscribe((result) => {
          this.dialogRef.close({ state: 'successful' });
        }, (error: any) => {
          console.log('create city');
          console.log(error);
        });
    }
  }
  getEntryPointUrl() {
    return '/v1/api/gis/';
  }
}
