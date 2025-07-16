import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { CarManufacturerGroupLookup } from '../lookups/car-manufacturer-group/car-manufacturer-group-lookup.dialog';
import { CarManufacturerDto } from './dtos/CarManufacturerDto';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { concat, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap
} from 'rxjs/operators';
import { CarManufacturerGroupDialog } from '../car-manufacturer-group/car-manufacturer-group.dialog';
import { CarManufacturerGroupDto } from '../car-manufacturer-group/dtos/CarManufacturerGroupDto';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'car-Manufacturer.dialog',
  templateUrl: 'car-Manufacturer.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class CarManufacturerDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;
  groups = [];
  groupsLoading = false;
  groups$: Observable<Object | any[]>;
  groupsInput$ = new Subject<string>();

  citiesLoading = false;
  cities$: Observable<Object | any[]>;
  citiesInput$ = new Subject<string>();
  // getgroups() : void {   this.http.get("/v1/api/Lookup/carManufacturerGroups").subscribe(result => this.groups = Normalize(result));  }

  constructor(
    public dialogRef: MatDialogRef<CarManufacturerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public authService: AuthService
  ) {
    super();
  }

  get name() {
    return this.form.get('name');
  }

  ngOnInit() {
    this.loadGroups();
    this.loadCities();
    this.form = this.fb.group(
      {
        name: ['', Validators.required, this.uniqueName.bind(this)],        
        cityId: ['', Validators.required],
        groupId: ['', Validators.required]
      },
      { updateOn: 'blur' }
    );
    if (this.data.isEdit === true) {
      this.form.setValue({
        name: this.data.CarManufacturer.name,
        cityId: this.data.CarManufacturer.cityId,
        groupId: this.data.CarManufacturer.group.id
      });
    }
  }
  uniqueName(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    const equalOriginal = ctrl.value === this.data.CarManufacturer.name;

    if (equalOriginal) { return of(null); }

    return this.http.get<any>(`${this.getUrl()}Name/${ctrl.value}`).pipe(
      map(names => {
        return names && names.entities.length > 0 && !equalOriginal
          ? { uniqueName: true }
          : null;
      })
    );
  }
  private loadCities() {
    this.cities$ = concat(
      of([
        {
          id: this.data.CarManufacturer.cityId,
          title: this.data.CarManufacturer.cityName
        }
      ]),
      this.citiesInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.citiesLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/cities/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.citiesLoading = false))
          )
        )
      )
    );
  }
  private loadGroups() {
    this.groups$ = concat(
      of([
        {
          id: this.data.CarManufacturer.group.id,
          title: this.data.CarManufacturer.group.title
        }
      ]),
      this.groupsInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.groupsLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/carManufacturerGroups/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.groupsLoading = false))
          )
        )
      )
    );
  }
  onCreateGroup(): void {
    const dialogRef = this.dialog.open(CarManufacturerGroupDialog, {
      width: '400px',
      height: '250px',
      disableClose: true,
      data: {
        CarManufacturerGroup: new CarManufacturerGroupDto(null),
        dialogTitle: 'ایجاد',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
      }
    });
  }
  OnNgSelectKeyDown(event: any, type: string) {
    if (event.code === 'F4') {
      event.preventDefault();
      event.stopPropagation();
      if (type === 'groups') { this.onCreateGroup(); }
    } else if (event.code === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
    }
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
          this.getUrl() + data.CarManufacturer.id,
          JSON.stringify({
            Name: this.form.get('name').value,
            GroupId: this.form.get('groupId').value,
            CityId: this.form.get('cityId').value,
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('create Car Manufacturer Group ');
            console.log(error);
          }
        );
    }
  }
  create(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http
        .post(
          this.getUrl(),
          JSON.stringify({
            Name: this.form.get('name').value,
            GroupId: this.form.get('groupId').value,
            CityId: this.form.get('cityId').value,
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('create Car Manufacturer Group');
            console.log(error);
          }
        );
    }
  }

  onGroupLookup(): void {
    const dialogRef = this.dialog.open(CarManufacturerGroupLookup, {
      width: '600px',
      height: '570px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب گروه خودروسازی',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        const group = new CarManufacturerDto(null);
        group.id = result.data.selectedItem.id;
        group.name = result.data.selectedItem.name;

        // this.onGroupSelectionChange(
        //   {
        //     isUserInput: true
        //   },
        //   group
        // );
      }
    });
  }

  getUrl() {
    return '/v1/api/CarManufacturer/';
  }
}
