import { Component, Inject, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from 'jalali-moment';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { AgentLookup } from '../lookups/agent/agent-lookup.dialog';
import { CarTypeLookupComponent } from '../lookups/car-type/car-type-lookup.dialog';
import { FixSentenceLookupComponent } from '../lookups/fix-sentence/fix-sentence-lookup.dialog';
import { LoadingLocationLookupComponent } from '../lookups/loading-location/loading-location-lookup.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { EntranceFromLookup } from '../lookups/entrance-from/entrance-from-lookup.dialog';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { CarDetailDto } from './dtos/CarDetailDto';
import { concat, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap
} from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { ErrorDialog } from '@shared/dialogs/Error/error.dialog';
import { AuthService } from '../../core/services/app-auth-n.service';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'car-dialog',
  templateUrl: 'car.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class CarDialog extends ModalBaseClass {
  addCar: AddCar;
  form: FormGroup;
  @ViewChild('bodyNumber') inputEl: ElementRef;
  constructor(
    public dialogRef: MatDialogRef<CarDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    public authService: AuthService
  ) {
    super();
    this.addCar = new AddCar(dialog, data, http);
  }

  onClose(): void {
    // if (!this.form.dirty) {
    this.dialogRef.close({ data: null, state: 'cancel' });
    // } else {
    //   const dialogRef = this.dialog.open(ConfirmDialog, {
    //     width: '250px',
    //     data: { state: 'ok' }
    //   });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result.state === 'confirmed') {
    //     this.dialogRef.close({ data: null, state: 'cancel' });
    //   }
    // });
    // }
  }

  onSave(): void {
    // if (this.form.valid) {
    if (this.addCar.data.isEdit === true) {
      this.edit(this.addCar.data);
    } else {
      this.create(this.addCar.data);
      this.inputEl.nativeElement.focus();
    }
    // }
  }

  edit(data): void {
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http
        .put(
          this.getEntryPintUrl() + data.Car.id,
          JSON.stringify({
            BodyNumber: data.Car.bodyNumber,
            ExternalNumber: data.Car.externalNumber,
            Owner: data.Car.owner,
            TargetAgentId: data.Car.agentId,
            DeliveryAgentId: data.Car.deliveryAgentId,
            CarTypeId: data.Car.carTypeId,
            EntranceFromId: data.Car.entranceFromId,
            RegisteredDate:
              data.registeredDate != null
                ? moment.from(data.registeredDate, 'fa').format('YYYY/MM/DD')
                : null,
            DescriptionOfSupply: data.Car.descriptionOfSupply,
            LoadingLocationId: data.Car.loadingLocationId
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('edit car');
            console.log(error);
          }
        );
    }
  }

  create(data): void {
    if (data) {
      const initCar = <CarDetailDto>{
        bodyNumber: '',
        externalNumber: '',
        owner: data.Car.owner,
        agentId: -1,
        carTypeId: -1,
        entranceFromId:
          data.Car.entranceFrom != null ? data.Car.entranceFromId : null,
        registeredDate:
          data.registeredDate != null
            ? moment.from(data.registeredDate, 'fa').format('YYYY/MM/DD')
            : moment().locale('fa'),
        descriptionOfSupply: data.Car.descriptionOfSupply,
        loadingLocationId: data.Car.loadingLocationId
      };
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http
        .post(
          this.getEntryPintUrl(),
          JSON.stringify({
            BodyNumber: data.Car.bodyNumber,
            ExternalNumber: data.Car.externalNumber,
            Owner: data.Car.owner,
            TargetAgentId: data.Car.agentId,
            DeliveryAgentId: data.Car.deliveryAgentId,
            CarTypeId: data.Car.carTypeId,
            EntranceFromId: data.Car.entranceFromId,
            RegisteredDate:
              data.registeredDate != null
                ? moment.from(data.registeredDate, 'fa').format('YYYY/MM/DD')
                : moment().locale('fa'),
            DescriptionOfSupply: data.Car.descriptionOfSupply,
            LoadingLocationId: data.Car.loadingLocationId,
            BranchId: this.authService.selectedBranchId
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            // this.dialogRef.close({ state: "successful" });

            // this.form.reset();
            this.initialAddCar(initCar);
          },
          (error: any) => {
            console.log('create car');
            console.log(error);
          }
        );
    }
  }

  getEntryPintUrl() {
    return '/v1/api/Car/';
  }

  initialAddCar(carDto: CarDetailDto = null): void {
    const currentDate = moment();
    const car = new CarDetailDto(carDto);
    this.addCar = new AddCar(
      this.dialog,
      {
        datePickerConfig: {
          // drops: "down",
          openOnClick: 'false',
          openOnFocus: 'false',
          format: 'YYYY/M/D',
          showGoToCurrent: 'true'
        },
        Car: car,
        externalNumber: car.externalNumber,
        registeredDate: currentDate.locale('fa'),
        dialogTitle: 'ایجاد',
        isEdit: false
      },
      this.http
    );
  }
}

export class AddCar {
  agents = [];
  agentsLoading = false;
  agents$: Observable<Object | any[]>;
  agentsInput$ = new Subject<string>();

  carTypes = [];
  enableCarType=true;
  entranceFroms = [];
  loadingLocations = [];
  fixSentences = [];

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {
    this.fillAllCollections();
  }

  private loadAgents() {
    this.agents$ = concat(
      of([
        {
          id: this.data.Car.agentId,
          title: this.data.Car.agentTitle
        },
        {
          id: this.data.Car.deliverAgentId,
          title: this.data.Car.deliveryAgentTitle
        }
      ]),
      this.agentsInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.agentsLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/agents/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.agentsLoading = false))
          )
        )
      )
    );
  }
  fillAllCollections(): void {
    this.loadAgents();
    // this.getAgents();
    this.getCarTypes();
    this.getEntranceFroms();
    this.getLoadingLocations();
    this.getFixSentences();
  }

  getAgents(): void {
    this.http
      .get('/v1/api/Lookup/agents')
      .subscribe(result => (this.agents = Normalize(result)));
  }

  getCarTypes(): void {
    this.http
      .get('/v1/api/Lookup/carTypes')
      .subscribe((result: ILookupResultDto[]) => (this.carTypes = result));
    // this.http.get("/v1/api/Lookup/carGroups2").subscribe(result => this.carGroups = Normalize(result));
  }

  getEntranceFroms(): void {
    this.http
      .get('/v1/api/Lookup/entranceFroms')
      .subscribe(result => (this.entranceFroms = Normalize(result)));
  }

  getLoadingLocations(): void {
    this.http
      .get('/v1/api/Lookup/loadingLocations')
      .subscribe(result => (this.loadingLocations = Normalize(result)));
  }

  getFixSentences(): void {
    this.http
      .get('/v1/api/Lookup/fixSentences')
      .subscribe(result => (this.fixSentences = Normalize(result)));
  }

  onBlurNumber(): void {
    this.enableCarType = true;
    if (!this.data.isEdit) {
      this.http
        .get('/v1/api/Car/bodyNumber/' + this.data.Car.bodyNumber)
        .subscribe(result => {
          if (result) {
            const dialogRef = this.dialog.open(ErrorDialog, {
              width: '250px',
              data: { state: 'ok' }
            });
          }
        });
    }
    if (this.data.Car.bodyNumber && this.data.Car.bodyNumber.length > 3) {
      const carTypeCode: string = this.data.Car.bodyNumber.substring(0, 3);
      const carType = this.carTypes.find(function (obj) {
        return obj.alt === carTypeCode;
      });
      if (carType !== undefined && carType != null) {
        this.data.Car.carTypeId = +carType.id;
      }
      else {
        this.enableCarType = false;
        alert('کد این خودرو در لیست سواریها نیست . این کد سواری را وارد کنید بعد اقدام به ثبت شاسی نمایید');
      }
    }
  }

  OnNgSelectKeyDown(event: any, type: string) {
    if (event.code === 'F4') {
      event.preventDefault();
      event.stopPropagation();
      if (type === 'loadingLocation') {
        this.onLoadingLocationLookup();
      } else if (type === 'entranceFrom') {
        this.onEntranceFromLookup();
      } else if (type === 'agents') {
        this.onTargetAgentLookup();
      } else if (type === 'carType') {
        this.onCarTypeLookup();
      } else if (type === 'descriptionOfSupply') {
        this.onFixSentenceLookup();
      }
    } else if (event.code === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  // Lokup modals
  onTargetAgentLookup(): void {
    const dialogRef = this.dialog.open(AgentLookup, {
      width: '600px',
      height: '570px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب نمایندگی مقصد',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        this.getAgents();
        this.data.Car.agentId = result.data.selectedItem.id;
      }
    });
  }

  onCarTypeLookup(): void {
    const dialogRef = this.dialog.open(CarTypeLookupComponent, {
      width: '600px',
      height: '570px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب نوع ماشین',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        this.getCarTypes();
        this.data.Car.carTypeId = result.data.selectedItem.id;
      }
    });
  }

  onFixSentenceLookup(): void {
    const dialogRef = this.dialog.open(FixSentenceLookupComponent, {
      width: '600px',
      height: '570px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب توضیحات لوازم خودرو',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        this.data.Car.descriptionOfSupply =
          result.data.selectedItem.description;
      }
    });
  }

  onLoadingLocationLookup(): void {
    const dialogRef = this.dialog.open(LoadingLocationLookupComponent, {
      width: '600px',
      height: '570px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب محل بارگیری',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        this.getLoadingLocations();
        this.data.Car.loadingLocationId = result.data.selectedItem.id;
      }
    });
  }

  onEntranceFromLookup(): void {
    const dialogRef = this.dialog.open(EntranceFromLookup, {
      width: '600px',
      height: '570px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب ورودی از',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        this.getEntranceFroms();
        this.data.Car.entranceFromId = result.data.selectedItem.id;
      }
    });
  }
}
