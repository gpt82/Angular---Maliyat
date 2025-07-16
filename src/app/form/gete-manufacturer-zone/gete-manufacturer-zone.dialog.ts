import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
@Component({
  selector: 'gete-manufacturer-zone-dialog',
  templateUrl: 'gete-manufacturer-zone.dialog.html',

})
export class GeteManufacturerZoneDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;
  public geteLoadingLocations = [];
  public geteManufacturers = [];
  public getZones = [];
  constructor(
    public dialogRef: MatDialogRef<GeteManufacturerZoneDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any, private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public authService: AuthService) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      geteManufacturerId: this.data.GeteManufacturerZone?.geteManufacturerId,
      geteLoadingLocationId: this.data.GeteManufacturerZone?.geteLoadingLocationId,
      geteZoneId: this.data.GeteManufacturerZone?.geteZoneId,
    });

    this.getGeteManufacturers();
    this.getGeteLoadingLocations();
    this.getGeteZones();
  }

  getGeteZones(): void {
    this.http
      .get('/v1/api/Lookup/geteZones')
      .subscribe((result: ILookupResultDto[]) => (this.getZones = result));
  }
  getGeteLoadingLocations(): void {
    this.http
      .get('/v1/api/Lookup/GeteLoadingLocations')
      .subscribe((result: ILookupResultDto[]) => (this.geteLoadingLocations = result));
  }
  getGeteManufacturers(): void {
    this.http
      .get('/v1/api/Lookup/geteManufacturers')
      .subscribe((result: ILookupResultDto[]) => (this.geteManufacturers = result));
  }
  // uniqueName(ctrl: AbstractControl): Observable<ValidationErrors | null> {
  //   const equalOriginal = ctrl.value === this.data.GeteManufacturerZone.name;

  //   if (equalOriginal) { return of(null); }

  //   return this.http.get<any>(`${this.getUrl()}Name/${ctrl.value}`).pipe(
  //     map(names => {
  //       return (names && names.entities.length > 0) && !equalOriginal ? { 'uniqueName': true } : null;
  //     })
  //   );
  // }
  onClose(): void {
    if (!this.form.dirty) {
      this.dialogRef.close({ data: null, state: 'cancel' });
    } else {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '400px',
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
    if (this.form.value) {
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
      const zone = JSON.stringify(
        {
          geteManufacturerId: this.form.get('geteManufacturerId').value,
          geteLoadingLocationId: this.form.get('geteLoadingLocationId').value,
          geteZoneId: this.form.get('geteZoneId').value
        });
      this.http.put(this.getUrl() + data.GeteManufacturerZone.id, zone, { headers: headers1 }).subscribe((result) => {
        this.dialogRef.close({ state: 'successful' });
      }, (error: any) => {
        console.log('edit loading location');
        console.log(error);
      });
    }
  }
  create(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      const zone = JSON.stringify(
        {
          geteManufacturerId: this.form.get('geteManufacturerId').value,
          geteLoadingLocationId: this.form.get('geteLoadingLocationId').value,
          geteZoneId: this.form.get('geteZoneId').value
        });

      this.http.post(this.getUrl(), zone, { headers: headers1 }).subscribe((result) => {
        this.dialogRef.close({ state: 'successful' });
      }, (error: any) => {
        console.log('create loading location');
        console.log(error);
      });
    }
  }
  getUrl() {
    return '/v1/api/GeteManufacturerZone/';
  }
}
