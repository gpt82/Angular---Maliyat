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
import { FareService } from './fare.service';
import { FareDto } from './dtos/FareDetailDto';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';


const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'fare-dialog',
  templateUrl: 'fare.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class FareDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;
  isSuperAdmin: boolean;
  branchs = [];

  citiesLoading = false;
  cities$: Observable<Object | any[]>;
  citiesInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<FareDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private fareService: FareService,
    public authService: AuthService
  ) {
    super();
    this.loadCities();
    this.getBranchs();
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
            contractNo: [this.data.Fare.contractNo, Validators.required],
            cityId: [this.data.Fare.cityId, Validators.required]
          },
          { asyncValidators: this.uniqueFare.bind(this) }
        ), // , {validator: this.uniqueFare.bind(this)}
        branchId: this.data.Fare.branchId,
        // driverFare: [this.data.Fare.driverFare || 0, Validators.required],
        // factoryFare: this.data.Fare.factoryFare || 0,
        preFare: [this.data.Fare.preFare || 0, {validators: [Validators.required],updateOn: 'change'}],
        fare6: [this.data.Fare.fare6 || 0, {validators: [Validators.required],updateOn: 'change'}],
        fare8: [this.data.Fare.fare8 || 0,  {validators: [Validators.required],updateOn: 'change'}]
      },
      { updateOn: 'blur' }
    );
  }

  initialize(): void { }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe(result => (this.branchs = Normalize(result)));
  }
  private loadCities() {
    this.cities$ = concat(
      of([
        {
          id: this.data.Fare.cityId,
          title: this.data.Fare.cityName
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

  // uniqueFare(group: FormGroup): Observable<ValidationErrors | null> {
  //     const contractNo = group.controls['contractNo'];
  //     const cityId = group.controls['cityId'];
  //     // if (ctrl.value === this.data.Agent.code) {
  //     //     return of(null);
  //     // }
  //     const equalOriginal = cityId.value === this.data.Fare.cityId && contractNo.value === this.data.Fare.contractNo;
  //     return equalOriginal? of(null) : this.fareService.getFare(cityId.value, contractNo.value).pipe(
  //         map(codes => {
  //             codes.entities.length > 0 ?  {'uniqueFare': true} :    null;
  //         })
  //     );
  // }

  uniqueFare(group: FormGroup): Observable<ValidationErrors | null> {
    const contractNo = group.controls['contractNo'];
    const cityId = group.controls['cityId'];
    // const BranchId = this.form.get('branchId').value || 0;
    const equalOriginal =
      cityId.value === this.data.Fare.cityId &&
      contractNo.value === this.data.Fare.contractNo;
    return equalOriginal
      ? of(null)
      : this.fareService.getFare(cityId.value, contractNo.value).pipe(
        map(exist => {
          return exist ? { uniqueFare: true } : null;
        })
      );
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
        CityId: this.form.get('fareGroup.cityId').value,
        // DriverFare: this.form.get('driverFare').value,
        // FactoryFare: this.form.get('factoryFare').value || 0,
        BranchId: this.form.get('branchId').value || 0,
        Fare6: this.form.get('fare6').value,
        Fare8: this.form.get('fare8').value,
        PreFare: this.form.get('preFare').value
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getUrl() + this.data.Fare.id, fare, { headers: header })
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
    return '/v1/api/Fare/';
  }
}
