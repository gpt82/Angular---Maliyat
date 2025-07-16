import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { concat, Observable, of, Subject, merge, interval } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
  combineLatest,
  mapTo
} from 'rxjs/operators';
import { GeteFareService } from './gete-fare.service';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'gete-fare-dialog',
  templateUrl: 'gete-fare.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class GeteFareDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;
  isSuperAdmin: boolean;
  geteZones = [];
  branchs = [];
  tonnageTypes = [];
  // geteManufacturers = [];

  citiesLoading = false;
  cities$: Observable<Object | any[]>;
  citiesInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<GeteFareDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private fareService: GeteFareService,
    public authService: AuthService
  ) {
    super();
    // this.loadCities();
    this.getBranchs();
    this.getTonnageTypes();
    this.getGeteZones();
    // this.getGeteLoadingLocations();
    this.isSuperAdmin = this.authService.hasRole(
      RolesConstants.SuperAdministrators
    );
  }

  ngOnInit() {
    this.initialize();
    this.form = this.fb.group(
      {
        fareGroup: this.fb.group(
          {
            contractNo: [this.data.GeteFare.contractNo, Validators.required],
            geteSenderZoneId: [this.data.GeteFare.geteSenderZoneId, Validators.required], // , {validator: this.uniqueGeteFare.bind(this)}
            geteReceiverZoneId: [this.data.GeteFare.geteReceiverZoneId, Validators.required], // , {validator: this.uniqueGeteFare.bind(this)}
            branchId: this.data.GeteFare.branchId,
            // geteLoadingLocationId: this.data.GeteFare.geteLoadingLocationId,
            // geteManufacturerId: this.data.GeteFare.geteManufacturerId,
            tonnageTypeId: [this.data.GeteFare.tonnageTypeId || 0, Validators.required],
          },
          // { asyncValidators: this.uniqueGeteFare.bind(this) }
        ),
        // factoryGeteFare: this.data.GeteFare.factoryGeteFare || 0,
        // preFare: [this.data.GeteFare.preFare || 0, {validators: [Validators.required],updateOn: 'change'}],
        // fare6: [this.data.GeteFare.fare6 || 0, {validators: [Validators.required],updateOn: 'change'}],
        fare: [this.data.GeteFare.fare || 0, { validators: [Validators.required], updateOn: 'change' }]
      },
      { updateOn: 'blur' }
    );
  }

  initialize(): void { }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }
  getTonnageTypes(): void {
    this.http
      .get('/v1/api/Lookup/tonnageTypes')
      .subscribe((result: ILookupResultDto[]) => (this.tonnageTypes = result));
  }
  getGeteZones(): void {
    this.http
      .get('/v1/api/Lookup/geteZones')
      .subscribe((result: ILookupResultDto[]) => (this.geteZones = result));
  }
  // getGeteManufacturers(): void {
  //   this.http
  //     .get('/v1/api/Lookup/senders')
  //     .subscribe((result: ILookupResultDto[]) => (this.geteManufacturers = result));
  // }
  private loadCities() {
    this.cities$ = concat(
      of([
        {
          id: this.data.GeteFare.cityId,
          title: this.data.GeteFare.cityName
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

  // uniqueGeteFare(group: FormGroup): Observable<ValidationErrors | null> {
  //     const contractNo = group.controls['contractNo'];
  //     const cityId = group.controls['cityId'];
  //     // if (ctrl.value === this.data.Agent.code) {
  //     //     return of(null);
  //     // }
  //     const equalOriginal = cityId.value === this.data.GeteFare.cityId && contractNo.value === this.data.GeteFare.contractNo;
  //     return equalOriginal? of(null) : this.fareService.getGeteFare(cityId.value, contractNo.value).pipe(
  //         map(codes => {
  //             codes.entities.length > 0 ?  {'uniqueGeteFare': true} :    null;
  //         })
  //     );
  // }

  uniqueGeteFare(group: FormGroup): Observable<ValidationErrors | null> {
    const contractNo = group.controls['contractNo'].value;
    const cityId = group.controls['cityId'].value;
    const loadingLocationId = group.controls['geteLoadingLocationId'].value;
    const senderId = group.controls['geteZoneId'].value;
    const tonnageTypeId = group.controls['tonnageTypeId'].value;

    if (contractNo == undefined ||
      !(cityId > 0) ||
      !(loadingLocationId > 0) ||
      !(senderId > 0) ||
      !(tonnageTypeId > 0))
      return of(null);

    const equalOriginal =
      contractNo === this.data.GeteFare.contractNo &&
      loadingLocationId === this.data.GeteFare.geteLoadingLocationId &&
      // senderZoneId === this.data.GeteFare.geteSenderZoneId &&
      tonnageTypeId === this.data.GeteFare.tonnageTypeId &&
      cityId === this.data.GeteFare.cityId
      ;
    return !equalOriginal
      ? this.fareService.getGeteFare(0, 0, contractNo, loadingLocationId, senderId, tonnageTypeId, cityId).pipe(
        map(exist => {
          return exist['id'] > 0 ? { uniqueGeteFare: true } : null;
        })
      )
      : of(null);
  }

  OnNgSelectKeyDown(event: any, type: string) {
    if (event.code === 'Escape') {
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
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });

      const fare = JSON.stringify({
        ContractNo: this.form.get('fareGroup.contractNo').value,
        // CityId: this.form.get('fareGroup.cityId').value,
        BranchId: this.form.get('fareGroup.branchId').value || 0,
        // LoadingLocationId: this.form.get('fareGroup.geteLoadingLocationId').value || 0,
        GeteSenderZoneId: this.form.get('fareGroup.geteSenderZoneId').value || 0,
        GeteReceiverZoneId: this.form.get('fareGroup.geteReceiverZoneId').value || 0,
        Fare: this.form.get('fare').value,
        TonnageTypeId: this.form.get('fareGroup.tonnageTypeId').value,

      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getUrl() + this.data.GeteFare.id, fare, { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit fare');
              console.log(error);
            }
          );
      } else {
        this.http.post(this.getUrl(), fare, { headers: header }).subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('create fare');
            console.log(error);
          }
        );
      }
    }
  }

  getUrl() {
    return '/v1/api/GeteFare/';
  }
}
