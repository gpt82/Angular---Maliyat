import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import {
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
import { TrailerFareService } from './trailer-fare.service';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';



@Component({
  // tslint:disable-next-line:component-selector
  selector: 'trailer-fare-dialog',
  templateUrl: 'trailer-fare.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class TrailerFareDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;
  isSuperAdmin: boolean;
  branchs = [];
  tonnageTypes = [];
  senders = [];

  citiesLoading = false;
  cities$: Observable<Object | any[]>;
  citiesInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<TrailerFareDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private fareService: TrailerFareService,
    public authService: AuthService
  ) {
    super();
    this.getLookups();
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
            contractNo: [this.data.TrailerFare.contractNo, Validators.required],
            cityId: [this.data.TrailerFare.cityId, Validators.required],
            tonnageTypeId: [this.data.TrailerFare.tonnageTypeId, Validators.required],
            senderId: [this.data.TrailerFare.senderId, Validators.required],
          },
          { asyncValidators: this.uniqueTrailerFare.bind(this) }
        ), // , {validator: this.uniqueTrailerFare.bind(this)}
        branchId: this.data.TrailerFare.branchId,
        fare: [this.data.TrailerFare.fare || 0, { validators: [Validators.required], updateOn: 'change' }]
      },
      { updateOn: 'blur' }
    );
  }

  initialize(): void { }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/tonnageTypes')
      .subscribe((result: ILookupResultDto[]) => (this.tonnageTypes = result));
  }
  getTonnageTypes(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }
  getSenders(): void {
    this.http
      .get('/v1/api/Lookup/senders')
      .subscribe((result: ILookupResultDto[]) => (this.senders = result));
  }
  private loadCities() {
    this.cities$ = concat(
      of([
        {
          id: this.data.TrailerFare.cityId,
          title: this.data.TrailerFare.cityName
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
  getLookups(): void {

    this.loadCities();
    this.getBranchs();
    this.getTonnageTypes();
    this.getSenders();
  }
  // uniqueTrailerFare(group: FormGroup): Observable<ValidationErrors | null> {
  //     const contractNo = group.controls['contractNo'];
  //     const cityId = group.controls['cityId'];
  //     // if (ctrl.value === this.data.Agent.code) {
  //     //     return of(null);
  //     // }
  //     const equalOriginal = cityId.value === this.data.TrailerFare.cityId && contractNo.value === this.data.TrailerFare.contractNo;
  //     return equalOriginal? of(null) : this.fareService.getTrailerFare(cityId.value, contractNo.value).pipe(
  //         map(codes => {
  //             codes.entities.length > 0 ?  {'uniqueTrailerFare': true} :    null;
  //         })
  //     );
  // }

  uniqueTrailerFare(group: FormGroup): Observable<ValidationErrors | null> {
    const contractNo = group.controls['contractNo'];
    const cityId = group.controls['cityId'];
    const tonnageTypeId = group.controls['tonnageTypeId'];
    const senderId = group.controls['senderId'];
    const equalOriginal =
      cityId.value === this.data.TrailerFare.cityId &&
      tonnageTypeId.value === this.data.TrailerFare.tonnageTypeId &&
      senderId.value === this.data.TrailerFare.senderId &&
      contractNo.value === this.data.TrailerFare.contractNo;
    return equalOriginal ? of(null) : this.fareService.getTrailerFare(cityId.value, tonnageTypeId.value, contractNo.value, senderId.value).pipe(
      map(exist => {
        return exist ? { uniqueTrailerFare: true } : null;
      })
    );
  }

  OnNgSelectKeyDown(event: any) {
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
        TonnageTypeId: this.form.get('fareGroup.tonnageTypeId').value,
        SenderId: this.form.get('fareGroup.senderId').value,
        Fare: this.form.get('fare').value,
        BranchId: this.form.get('branchId').value || this.authService.selectedBranchId,
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getUrl() + this.data.TrailerFare.id, fare, { headers: header })
          .subscribe(
            () => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit fare');
              console.log(error);
            }
          );
      } else {
        this.http.post(this.getUrl(), fare, { headers: header }).subscribe(
          () => {
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
    return '/v1/api/TrailerFare/';
  }
}
