import { Component, Inject, HostListener, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { CarGroupLookup } from '../lookups/car-group/car-group-lookup.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CarTypeService } from './car-type.service';
import { uniqueCarTypeNameValidator, uniqueCarTypeCodeValidator } from './car-type.validator';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { CarGroupDto } from '../car-group/dtos/CarGroupDto';
import { CarGroupDialog } from '../car-group/car-group.dialog';
import { AuthService } from '../../core/services/app-auth-n.service';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'car-type-dialog',
  templateUrl: 'car-type.dialog.html',

})
// tslint:disable-next-line:component-class-suffix
export class CarTypeDialog extends ModalBaseClass implements OnInit, AfterViewInit {
  form: FormGroup;
  groupsLoading = false;
  groups$: Observable<Object | any[]>;
  groupsInput$ = new Subject<string>();
  @ViewChild('picker') picker;
  public value: Date = new Date(2020, 2, 10);
  constructor(
    public dialogRef: MatDialogRef<CarTypeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService) {
    super();
    // this.getCarGroups();
    this.loadCarGroups();
  }
  ngAfterViewInit(): void {
    console.log('hhh');
    window.onload = function () {
      console.log(this.picker);
    };
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required, this.uniqueCarTypeCode.bind(this)],
      groupId: ['', Validators.required]
    }, { updateOn: 'blur' });
    if (this.data.isEdit === true) {
      this.form.setValue({
        name: this.data.CarType.name,
        code: this.data.CarType.code,
        groupId: this.data.CarType.groupId
      });
    }
  }
  get code() {
    return this.form.get('code');
  }

  uniqueCarTypeCode(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    const equalOriginal = ctrl.value === this.data.CarType.code;

    if (equalOriginal) { return of(null); }

    return this.http.get<any>(`${this.getEntryPointUrl()}Code/${ctrl.value}`).pipe(
      map(codes => {
        return (codes && codes.entities.length > 0) && !equalOriginal ? { 'uniqueCode': true } : null;
      })
    );
  }
  private loadCarGroups() {
    this.groups$ = concat(
      of([{
        'id': this.data.CarType.groupId,
        'title': this.data.CarType.groupName
      }]),
      this.groupsInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => this.groupsLoading = true),
        switchMap(term => this.http.get('/v1/api/Lookup/carGroups2/' + term).pipe(
          catchError(() => of([])),
          tap(() => this.groupsLoading = false)
        ))
      )
    );
  }
  onCreateCarGroup(): void {
    const dialogRef = this.dialog.open(CarGroupDialog, {
      width: '400px',
      height: '250px',
      disableClose: true,
      data: {
        CarGroup: new CarGroupDto(),
        dialogTitle: 'ایجاد',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
      }
    });
  }
  getCarGroups(): void {
    // this.http.get("/v1/api/Lookup/carGroups2").subscribe(result => this.carGroups = Normalize(result));
  }
  OnNgSelectKeyDown(event: any, type: string) {
    if (event.code === 'F4') {
      event.preventDefault();
      event.stopPropagation();
      if (type === 'carGroups') { this.onCreateCarGroup(); }
    } else if (event.code === 'Escape') {
      event.stopPropagation();
      event.preventDefault();

    }
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
  create(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.post(this.getEntryPointUrl(), JSON.stringify({
        Name: this.form.get('name').value,
        Code: this.form.get('code').value,
        TypeId: this.form.get('groupId').value
      }), { headers: headers1 }).subscribe((result) => {
        this.dialogRef.close({ state: 'successful' });
      }, (error: any) => {
        console.log('create car type');
        console.log(error);
      });
    }
  }
  edit(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.put(this.getEntryPointUrl() + data.CarType.id,
        JSON.stringify({
          Name: this.form.get('name').value,
          Code: this.form.get('code').value,
          TypeId: this.form.get('groupId').value
        }), { headers: headers1 }).subscribe((result) => {
          this.dialogRef.close({ state: 'successful' });
        }, (error: any) => {
          console.log('create car type');
          console.log(error);
        });
    }
  }

  onCarGroupLookup(): void {
    const dialogRef = this.dialog.open(CarGroupLookup, {
      width: '600px',
      height: '570px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب گروه سواری',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getCarGroups();
      this.data.CarType.groupId = result.data.selectedItem.id;

    });
  }
  getEntryPointUrl() {
    return '/v1/api/CarType/';
  }
}
