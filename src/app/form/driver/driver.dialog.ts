import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { TrailerLookup } from '../lookups/trailer/trailer-lookup.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { ConverterService } from '../../shared/services/converter-service';
import { FileExtensionService } from '../../shared/services/file-extension-service';
import { FileDto } from '../../shared/dtos/FileDto';

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
import { TrailerDialog } from '../trailer/trailer.dialog';
import { TrailerDetailDto } from '../trailer/dtos/TrailerDetailDto';
import { AuthService } from '../../core/services/app-auth-n.service';
import { Address } from './dtos/DriverDetailDto';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'driver-dialog',
  templateUrl: 'driver.dialog.html',
  styles: [
    '.imagePlaceHolder {border:2px dotted blue;width: 200px;Height: 220px; } ' +
    '.font{    font-size: 14px;  }' +
    '.add-photo{width: 37px;}'
  ]
})
// tslint:disable-next-line: component-class-suffix
export class DriverDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;
  selectedFile: File;
  reader = new FileReader();
  localUrl: any;
  notifyUniqueFullName = false;
  image: FileDto;

  citiesLoading = false;
  cities$: Observable<Object | any[]>;
  citiesInput$ = new Subject<string>();

  people = [];
  trailers = [];
  bankNames = [];

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<DriverDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private _sanitizer: DomSanitizer,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    super();
    if (this.data.isEdit === true) {
      this.getDriverImage();
    }
  }

  get fullName() {
    return this.form.get('fullName');
  }
  get smartCode() {
    return this.form.get('smartCardNumber');
  }

  get licence() {
    return this.form.get('licenseNumber');
  }

  ngOnInit() {
    this.loadTrailers();
    this.getBanks();
    this.createForm();
    this.loadCities();
    this.fullNameOnChange();
  }
  private loadCities() {
    this.cities$ = concat(
      of([
        {
          id: this.data.Driver.address?.cityId,
          title: this.data.Driver.cityName
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
  fullNameOnChange() {
    const fullName$ = this.form.get('fullName').valueChanges;
    fullName$.subscribe(() => {
      const name = this.fullName.value.firstName;
      const family = this.fullName.value.lastName;
      const equalOriginal =
        name === this.data.Driver.firstName &&
        family === this.data.Driver.lastName;
      if (!equalOriginal) {
        if (this.fullName.valid) {
          this.http.get<boolean>(`/v1/api/driver/getDriver/${name}/${family}`).
            subscribe(res => this.notifyUniqueFullName = res);
        }
      }
    });
  }
  createForm() {
    this.form = this.fb.group(
      {
        smartCardNumber: [
          this.data.Driver.smartCardNumber,
          Validators.required,
          this.uniqueSmartCode.bind(this)
        ],
        nationCardNumber: [this.data.Driver.nationCardNumber, Validators.required],
        licenseNumber: [
          this.data.Driver.licenseNumber,
          Validators.required,
          this.uniqueLicenseNumber.bind(this)
        ],
        fullName: this.fb.group(
          {
            firstName: [this.data.Driver.firstName, Validators.required],
            lastName: [this.data.Driver.lastName, Validators.required]
          }
          // ,{ asyncValidators: this.uniqueFullName.bind(this) }
        ),
        cityId: [this.data.Driver.address?.cityId, Validators.required],
        street: [this.data.Driver.address?.street, Validators.required],
        byStreet: [this.data.Driver.address?.byStreet],
        alley: [this.data.Driver.address?.alley],
        no: [this.data.Driver.address?.no],
        postalCode: [this.data.Driver.address?.postalCode, Validators.required],
        phone: [this.data.Driver.address?.mobile],
        mobile: [this.data.Driver.address?.phone, Validators.required],
        accNumber: this.data.Driver.accNumber,
        accOwner: this.data.Driver.accOwner,
        accBankId: this.data.Driver.accBankId,
        isOwner: this.data.Driver.isOwner,
        trailerId: [this.data.Driver.trailerId, Validators.required],
        tafsiliAccount: this.data.Driver.tafsiliAccount,
        hasInfringement: this.data.Driver.hasInfringement,
        infringementDescription: this.data.Driver.infringementDescription
      },
      { updateOn: 'blur' }
    );
  }
  getBanks(): void {
    this.http.get('/v1/api/Lookup/banks').subscribe((result: ILookupResultDto[]) => this.bankNames = result);
  }
  // uniqueFullName(group: FormGroup): Observable<ValidationErrors | null> {
  //   const name = group.controls['firstName'];
  //   const family = group.controls['lastName'];
  //   // const BranchId = this.form.get('branchId').value || 0;
  //   const equalOriginal =
  //     name.value === this.data.Driver.firstName &&
  //     family.value === this.data.Driver.lastName;
  //   return equalOriginal
  //     ? of(null)
  //     : this.http.get<boolean>(`/v1/api/driver/getDriver/${name.value}/${family.value}`).pipe(
  //       map(codes => {
  //         return codes && !equalOriginal ? { uniqueFullName: true } : null;
  //       })
  //     );
  // }
  uniqueSmartCode(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    const equalOriginal = ctrl.value === this.data.Driver.smartCardNumber;

    if (equalOriginal) { return of(null); }

    return this.http
      .get<any>(`${this.getEntryPointUrl()}SmartCardNumber/${ctrl.value}`)
      .pipe(
        map(codes => {
          return codes && codes.entities.length > 0 && !equalOriginal
            ? { uniqueSmartCode: true }
            : null;
        })
      );
  }

  uniqueLicenseNumber(
    ctrl: AbstractControl
  ): Observable<ValidationErrors | null> {
    const equalOriginal = ctrl.value === this.data.Driver.licenseNumber;

    if (equalOriginal) { return of(null); }

    return this.http
      .get<any>(`${this.getEntryPointUrl()}LicenseNumber/${ctrl.value}`)
      .pipe(
        map(codes => {
          return codes && codes.entities.length > 0 && !equalOriginal
            ? { uniqueLicenseNumber: true }
            : null;
        })
      );
  }

  private loadTrailers() {
    this.trailers$ = concat(
      of([
        {
          id: this.data.Driver.trailerId,
          title: this.data.Driver.trailerPlaque
        }
      ]),
      this.trailersInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.trailersLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/trailers/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.trailersLoading = false))
          )
        )
      )
    );
  }
  onCreateTrailer(): void {
    const currentDate = moment();
    const dialogRef = this.dialog.open(TrailerDialog, {
      width: '600px',
      height: '370px',
      disableClose: true,
      data: {
        Trailer: new TrailerDetailDto(null),
        dialogTitle: 'ایجاد',
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D',
          showGoToCurrent: 'true'
        },
        thirdPartyInsuranceDate: currentDate.locale('fa'),
        techDiagnosisInsuranceDate: currentDate.locale('fa'),
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
      if (type === 'trailers') { this.onCreateTrailer(); }
    } else if (event.code === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  getDriverImage(): void {
    const url = '/v1/api/Driver/' + this.data.Driver.id + '/image';
    this.http.get(url).subscribe(result => {
      if (result['content'] === null || result['content'] === '') { return; }
      this.localUrl = this._sanitizer.bypassSecurityTrustResourceUrl(
        'data:' + result['contentType'] + ';base64,' + result['content']
      );

      this.image = new FileDto();
      this.image.Content = result['content'];
      this.image.ContentType = result['contentType'];
      this.image.FileName = result['fileName'];
    });
  }

  incorrectCode(): void {
    this.snackBar.open('کد وارد شده اشتباه می باشد!', 'خطا', {
      duration: 3000,
      panelClass: ['snack-bar-info']
    });
  }

  getUrl(endPoint) {
    return endPoint;
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

  showPreviewImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      const fileSize = ConverterService.ByteToMegaByte(
        event.target.files[0].size
      );
      if (fileSize > 2) {
        this.snackBar.open(
          'حجم فایل نمی تواند بیشستر از 2 مگابایت باشد- حجم فایل = ' +
          fileSize +
          ' مگابایت.',
          'خطا',
          {
            duration: 3000,
            panelClass: ['snack-bar-info']
          }
        );
        return;
      }
      const isValidFormat = FileExtensionService.IsValidImageFormatByFileName(
        event.target.files[0].name
      );
      if (!isValidFormat) {
        this.snackBar.open(
          'فایل باید حتما تصویر با پسوند jpg یا png باشد',
          'خطا',
          {
            duration: 3000,
            panelClass: ['snack-bar-info']
          }
        );
        return;
      }

      this.reader.onload = (event: any) => {
        this.localUrl = event.target.result;
      };
      this.reader.readAsDataURL(event.target.files[0]);
      this.selectedFile = event.target.files[0];
      this.image = null;
    }
  }

  onDeleteDriverImage() {
    this.image = new FileDto();
    this.reader = new FileReader();
    this.localUrl = null;
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
      let address = <Address>{
        cityId: this.form.get('cityId').value,
        street: this.form.get('street').value,
        byStreet: this.form.get('byStreet').value,
        alley: this.form.get('alley').value,
        no: this.form.get('no').value,
        postalCode: this.form.get('postalCode').value,
        mobile: this.form.get('mobile').value,
        phone: this.form.get('phone').value,
      };
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http
        .put(
          this.getEntryPointUrl() + data.Driver.id,
          JSON.stringify({
            SmartCardNumber: this.form.get('smartCardNumber').value,
            LicenseNumber: this.form.get('licenseNumber').value,
            FirstName: this.form.get('fullName.firstName').value,
            LastName: this.form.get('fullName.lastName').value,
            NationCardNumber: this.form.get('nationCardNumber').value,
            IsOwner: this.form.get('isOwner').value,
            Address: address, // this.form.get('address').value,
            AccNumber: this.form.get('accNumber').value,
            AccOwner: this.form.get('accOwner').value,
            AccBankId: this.form.get('accBankId').value,
            TrailerId: this.form.get('trailerId').value,
            TafsiliAccount: this.form.get('tafsiliAccount').value,
            hasInfringement: this.form.get('hasInfringement').value,
            infringementDescription: this.form.get('infringementDescription').value,
            Image: this.createImageDto()
          }),
          { headers: headers1 }
        )
        .subscribe(
          () => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('edit driver');
            console.log(error);
          }
        );
    }
  }

  create(data): void {
    if (data) {
      let address = <Address>{
        cityId: this.form.get('cityId').value,
        street: this.form.get('street').value,
        byStreet: this.form.get('byStreet').value,
        alley: this.form.get('alley').value,
        no: this.form.get('no').value,
        postalCode: this.form.get('postalCode').value,
        mobile: this.form.get('mobile').value,
        phone: this.form.get('phone').value,
      };
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http
        .post(
          this.getEntryPointUrl(),
          JSON.stringify({
            SmartCardNumber: this.form.get('smartCardNumber').value,
            LicenseNumber: this.form.get('licenseNumber').value,
            FirstName: this.form.get('fullName.firstName').value,
            LastName: this.form.get('fullName.lastName').value,
            NationCardNumber: this.form.get('nationCardNumber').value,
            Phone: this.form.get('phone').value,
            IsOwner: this.form.get('isOwner').value,
            AccNumber: this.form.get('accNumber').value,
            AccOwner: this.form.get('accOwner').value,
            AccBankId: this.form.get('accBankId').value,
            TrailerId: this.form.get('trailerId').value,
            TafsiliAccount: this.form.get('tafsiliAccount').value,
            HasInfringement: this.form.get('hasInfringement').value,
            InfringementDescription: this.form.get('infringementDescription').value,
            Address: address,
            Image: this.createImageDto()
          }),
          { headers: headers1 }
        )
        .subscribe(
          () => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('create driver');
            console.log(error);
          }
        );
    }
  }

  createImageDto(): FileDto {
    const image: FileDto = new FileDto();
    if (this.reader === null || this.reader.result === null) { return this.image; }

    image.Content = (<string>this.reader.result).split(',')[1];
    image.FileName = this.selectedFile.name;
    image.ContentType = this.selectedFile.type;
    return image;
  }

  onTrailerLookup(): void {
    const dialogRef = this.dialog.open(TrailerLookup, {
      width: '900px',
      height: '600px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب تریلر',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        // this.getTrailers();
        this.data.Driver.trailer.id = result.data.selectedItem.id;
        this.data.Driver.trailerId = result.data.selectedItem.id;
      }
    });
  }

  // onPersonLookup(): void {
  //   const dialogRef = this.dialog.open(PersonLookup, {
  //     width: '600px',
  //     height: '570px',
  //     disableClose: true,
  //     data: {
  //       dialogTitle: 'انتخاب شخص',
  //       selectedItem: null
  //     }
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result && result.data.selectedItem) {
  //       const person = new PersonDto(result.data.selectedItem);
  //       // let item =this.pepole.filter(x=>x.id === person.id);
  //       // if(item )
  //       //   this.pepole.push({ id: person.id, title: person.fullName+'('+person.nationalCode+')'});
  //       this.getPeople();
  //       this.data.Driver.person.id = person.id;
  //       // this.onPersonSelectionChange(
  //       //   {
  //       //     isUserInput: true
  //       //   },
  //       //   person
  //       // );
  //     }
  //   });
  // }

  getEntryPointUrl() {
    return '/v1/api/Driver/';
  }
}
