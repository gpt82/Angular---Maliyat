import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { TrailerBuilderLookupComponent } from '../lookups/trailer-builder/trailer-builder-lookup.dialog';
import { TonnageTypeLookupComponent } from '../lookups/tonnage-type/tonnage-type-lookup.dialog';
import { TrailerOWnerTypeLookup } from '../lookups/trailer-owner/trailer-owner-lookup.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import * as moment from 'jalali-moment';
import { concat, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap
} from 'rxjs/operators';
import { AuthService } from '../../core/services/app-auth-n.service';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'trailer-dialog',
  templateUrl: 'trailer.dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class TrailerDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;
  @ViewChild('issueDatePicker') issueDatePicker;
  @ViewChild('insureExpirDatePicker') insureExpirDatePicker;
  @ViewChild('healthCardExpirDatePicker') healthCardExpirDatePicker;
  @ViewChild('companyLicenseExpirDatePicker') companyLicenseExpirDatePicker;
  trailerBuilders = [];

  tonnageTypes1 = [];

  ownerTypes = [];

  trailerBuildersLoading = false;
  trailerBuilders$: Observable<Object | any[]>;
  trailerBuildersInput$ = new Subject<string>();

  tonnageTypesLoading = false;
  tonnageTypes$: Observable<Object | any[]>;
  tonnageTypesInput$ = new Subject<string>();

  ownerTypesLoading = false;
  ownerTypes$: Observable<Object | any[]>;
  ownerTypesInput$ = new Subject<string>();

  notifyUniquePlaque = false;

  chars = [
    'الف',
    'ب',
    'پ',
    'ت',
    'ث',
    'ج',
    'چ',
    'ح',
    'خ',
    'د',
    'ذ',
    'ر',
    'ز',
    'ژ',
    'س',
    'ش',
    'ص',
    'ض',
    'ط',
    'ظ',
    'ع',
    'غ',
    'ف',
    'ق',
    'ك',
    'ل',
    'م',
    'ن',
    'و',
    'ه',
    'ى'
  ];
  constructor(
    public dialogRef: MatDialogRef<TrailerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public authService: AuthService
  ) {
    super();
    this.fillAllCollections();
  }

  get code() {
    return this.form.get('smartCardNumber');
  }
  get plaque() {
    return this.form.get('plaque');
  }
  ngOnInit() {
    this.createForm();
    this.onPlaqueChange();


    // if (this.data.isEdit === true) {
    //   this.form.setValue({
    //     smartCardNumber: this.data.Trailer.smartCardNumber,
    //     ownerTypeId: this.data.Trailer.ownerTypeId,
    //     tonnageTypeId: this.data.Trailer.tonnageTypeId,
    //     builderId: this.data.Trailer.builderId,
    //     plate1: this.data.Trailer.plate1,
    //     plateChar: this.data.Trailer.plateChar,
    //     plate2: this.data.Trailer.plate2,
    //     plateIran: this.data.Trailer.plateIran
    //   });
    // }
  }
  createForm() {
    this.form = this.fb.group(
      {
        smartCardNumber: [
          this.data.Trailer.smartCardNumber,
          Validators.required,
          this.uniqueSmartCardNumber.bind(this)
        ],
        isBorrowLoan: this.data.Trailer.isBorrowLoan,
        isKafi: this.data.Trailer.isKafi,
        hasInfringement: this.data.Trailer.hasInfringement,
        infringementDescription: this.data.Trailer.infringementDescription,
        tafsiliAccount: this.data.Trailer.tafsiliAccount,
        ownerTypeId: this.data.Trailer.ownerTypeId,
        builderId: [this.data.Trailer.builderId, Validators.required],
        tonnageTypeId: this.data.Trailer.tonnageTypeId,
        insureExpirDate: this.data.Trailer.insureExpirDate,
        healthCardExpirDate: this.data.Trailer.healthCardExpirDate,
        companyLicenseExpirDate: this.data.Trailer.companyLicenseExpirDate,

        plaque: this.fb.group({
          plate1: [this.data.Trailer.plate1, Validators.required],
          plateChar: [this.data.Trailer.plateChar, Validators.required],
          plate2: [this.data.Trailer.plate2, Validators.required],
          plateIran: [this.data.Trailer.plateIran, Validators.required]
        })
      },
      { updateOn: 'blur' }
    );
  }
  popUpCalendar1() {
    this.insureExpirDatePicker.open();
  }
  popUpCalendar2() {
    this.healthCardExpirDatePicker.open();
  }
  popUpCalendar3() {
    this.companyLicenseExpirDatePicker.open();
  }
  onPlaqueChange() {
    const plaque$ = this.plaque.valueChanges;
    plaque$.subscribe(() => {
      const plate1 = this.plaque.value.plate1;
      const plateChar = this.plaque.value.plateChar;
      const plate2 = this.plaque.value.plate2;
      const plateIran = this.plaque.value.plateIran;
      const equalOriginal =
        plate1 === this.data.Trailer.plate1 &&
        plate2 === this.data.Trailer.plate2 &&
        plateChar === this.data.Trailer.plateChar &&
        plateIran === this.data.Trailer.plateIran;

      if (!equalOriginal) {
        if (this.plaque.valid) {
          const plq = plate2 + plateChar + plate1 + 'ایران' + plateIran;
          this.http.get<boolean>(`/v1/api/trailer/plaque/${plq}`).
            subscribe(res => {
              this.notifyUniquePlaque = res;
              console.log(this.notifyUniquePlaque);
            }
            );
        }
      }
    });
  }
  getOwnerTypes(): void {
    this.http
      .get('/v1/api/Lookup/ownerTypes')
      .subscribe(result => (this.ownerTypes = Normalize(result)));
  }
  getTonnageTypes(): void {
    this.http
      .get('/v1/api/Lookup/tonnageTypes')
      .subscribe(result => (this.tonnageTypes1 = Normalize(result)));
  }
  getTrailerBuilders(): void {
    this.http
      .get('/v1/api/Lookup/trailerbuilders')
      .subscribe(result => (this.trailerBuilders = Normalize(result)));
  }

  uniqueSmartCardNumber(
    ctrl: AbstractControl
  ): Observable<ValidationErrors | null> {
    const equalOriginal = ctrl.value === this.data.Trailer.smartCardNumber;

    if (equalOriginal) { return of(null); }

    return this.http
      .get<any>(`${this.getUrl()}SmartCardNumber/${ctrl.value}`)
      .pipe(
        map(codes => {
          return codes && codes.entities.length > 0 && !equalOriginal
            ? { uniqueSmartCardNumber: true }
            : null;
        })
      );
  }

  private loadTrailerBuilders() {
    this.trailerBuilders$ = concat(
      of([
        {
          id: this.data.Trailer.builderId,
          title: this.data.Trailer.builderTitle
        }
      ]),
      this.trailerBuildersInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.trailerBuildersLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/trailerBuilders/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.trailerBuildersLoading = false))
          )
        )
      )
    );
  }

  private loadTonnageTypes() {
    this.tonnageTypes$ = concat(
      of([
        {
          id: this.data.Trailer.tonnageTypeId,
          title: this.data.Trailer.tonnageTypeTitle
        }
      ]),
      this.tonnageTypesInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.tonnageTypesLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/tonnageTypes/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.tonnageTypesLoading = false))
          )
        )
      )
    );
  }

  private loadOwnerTypes() {
    this.ownerTypes$ = concat(
      of([
        {
          id: this.data.Trailer.ownerTypeId,
          title: this.data.Trailer.ownerTypeTitle
        }
      ]),
      this.ownerTypesInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.ownerTypesLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/ownerTypes/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.ownerTypesLoading = false))
          )
        )
      )
    );
  }

  fillAllCollections(): void {
    this.loadOwnerTypes();
    this.loadTrailerBuilders();
    this.loadTonnageTypes();
  }

  OnNgSelectKeyDown(event: any, type: string) {
    if (event.code === 'F4') {
      event.preventDefault();
      event.stopPropagation();
      if (type === 'ownerTypes') {
        this.onTrailerOwnerLookup();
      } else if (type === 'tonnageTypes') {
        this.onTonnageTypeLookup();
      } else if (type === 'trailerBuilders') {
        this.onTrailerBuilderLookup();
      }
    } else if (event.code === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  onHasInfringementSelectionChange(): void {
    if (!this.data.Trailer.hasInfringement) {
      this.data.Trailer.infringementDescription = '';
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

  create(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http
        .post(
          this.getUrl(),
          JSON.stringify({
            SmartCardNumber: this.form.get('smartCardNumber').value,
            TafsiliAccount: this.form.get('tafsiliAccount').value,
            Plate1: this.form.get('plaque.plate1').value,
            Plate2: this.form.get('plaque.plate2').value,
            PlateChar: this.form.get('plaque.plateChar').value,
            PlateIran: this.form.get('plaque.plateIran').value,
            BuilderId: this.form.get('builderId').value,
            TonnageTypeId: this.form.get('tonnageTypeId').value,
            OwnerTypeId: this.form.get('ownerTypeId').value,
            hasInfringement: this.form.get('hasInfringement').value,
            isBorrowLoan: this.form.get('isBorrowLoan').value ?? false,
            isKafi: this.form.get('isKafi').value ?? false,
            infringementDescription: this.form.get('infringementDescription').value,
            insureExpirDate: moment.from(this.form.get('insureExpirDate').value, 'en').utc(true).toJSON(),
            healthCardExpirDate: moment.from(this.form.get('healthCardExpirDate').value, 'en').utc(true).toJSON(),
            companyLicenseExpirDate: moment.from(this.form.get('companyLicenseExpirDate').value, 'en').utc(true).toJSON(),
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('create trailer');
            console.log(error);
          }
        );
    }
  }

  edit(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http
        .put(
          this.getUrl() + data.Trailer.id,
          JSON.stringify({
            SmartCardNumber: this.form.get('smartCardNumber').value,
            TafsiliAccount: this.form.get('tafsiliAccount').value,
            Plate1: this.form.get('plaque.plate1').value,
            Plate2: this.form.get('plaque.plate2').value,
            PlateChar: this.form.get('plaque.plateChar').value,
            PlateIran: this.form.get('plaque.plateIran').value,
            BuilderId: this.form.get('builderId').value,
            TonnageTypeId: this.form.get('tonnageTypeId').value,
            OwnerTypeId: this.form.get('ownerTypeId').value,
            HasInfringement: this.form.get('hasInfringement').value,
            isBorrowLoan: this.form.get('isBorrowLoan').value,
            isKafi: this.form.get('isKafi').value,
            InfringementDescription: this.form.get('infringementDescription').value,
            InsureExpirDate: moment.from(this.form.get('insureExpirDate').value, 'en').utc(true).toJSON(),
            HealthCardExpirDate: moment.from(this.form.get('healthCardExpirDate').value, 'en').utc(true).toJSON(),
            CompanyLicenseExpirDate: moment.from(this.form.get('companyLicenseExpirDate').value, 'en').utc(true).toJSON(),
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('edit trailer');
            console.log(error);
          }
        );
    }
  }

  // Lookup modals
  onTrailerBuilderLookup(): void {
    const dialogRef = this.dialog.open(TrailerBuilderLookupComponent, {
      width: '600px',
      height: '570px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب سازنده تریلر',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        this.getTrailerBuilders();
        this.data.Trailer.builderId = result.data.selectedItem.id;
      }
      // if (result && result.data.selectedItem) {
      //   this.onTrailerBuilderSelectionChange(
      //     {
      //       isUserInput: true
      //     },
      //     {
      //       id: result.data.selectedItem.id,
      //       name: result.data.selectedItem.name
      //     }
      //   );
      // }
    });
  }

  onTonnageTypeLookup(): void {
    const dialogRef = this.dialog.open(TonnageTypeLookupComponent, {
      width: '600px',
      height: '570px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب نوع مالکیت',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        this.getTonnageTypes();
        this.data.Trailer.tonnageTypeId = result.data.selectedItem.id;
      }
      //   this.onTonnageTypeSelectionChange(
      //     {
      //       isUserInput: true
      //     },
      //     {
      //       id: result.data.selectedItem.id,
      //       name: result.data.selectedItem.name,
      //       maxCapacity: result.data.selectedItem.maxCapacity,
      //       minCapacity: result.data.selectedItem.minCapacity
      //     }
      //   );
      // }
    });
  }

  onTrailerOwnerLookup(): void {
    const dialogRef = this.dialog.open(TrailerOWnerTypeLookup, {
      width: '600px',
      height: '570px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب نوع مالکیت',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        this.getOwnerTypes();
        this.data.Trailer.ownerTypeId = result.data.selectedItem.id;
      }
      //   this.onTrailerOwnerSelectionChange(
      //     {
      //       isUserInput: true
      //     },
      //     {
      //       id: result.data.selectedItem.id,
      //       name: result.data.selectedItem.name,
      //     }
      //   );
      // }
    });
  }

  getUrl() {
    return '/v1/api/Trailer/';
  }
}
