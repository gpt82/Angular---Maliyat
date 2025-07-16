import { Component, Inject, OnInit, ViewChild, OnDestroy, AfterViewInit, AfterViewChecked } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { concat, Observable, of, Subject, merge } from 'rxjs';

import { CarManufacturerLookup } from '../lookups/car-manufacturer/car-manufacturer-lookup.dialog';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap
} from 'rxjs/operators';
// import { AgentDialog } from '../agent/agent.dialog';
// import { AgentDetailDto } from '../agent/dtos/AgentDetailDto';
import { DriverDialog } from '../driver/driver.dialog';
import { DriverDetailDto } from '../driver/dtos/DriverDetailDto';
import { TrailerDialog } from '../trailer/trailer.dialog';
import { TrailerDetailDto } from '../trailer/dtos/TrailerDetailDto';
import { AgentDialog } from '../agent/agent.dialog';
import { AgentDetailDto } from '../agent/dtos/AgentDetailDto';
import { ILookupResultDto } from '@shared/dtos/LookupResultDto';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { FareService } from '../fare/fare.service';
import { FareDto } from '../fare/dtos/FareDetailDto';
import { AgendaService } from './agenda.service';
import { AuthService } from '../../core/services/app-auth-n.service';
import { TrailerCertDetailDto } from '../trailer-cert/dtos/TrailerCertDetailDto';
import { TrailerCertDialog } from '../trailer-cert/trailer-cert.dialog';
import { numberSymbols } from '@progress/kendo-angular-intl';
import { GeteFareDto } from '../gete-fare/dtos/Gete-FareDetailDto';
import { GeteFareService } from '../gete-fare/gete-fare.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'agenda-dialog',
  templateUrl: 'agenda.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class AgendaDialog extends ModalBaseClass implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('picker') picker;

  form: FormGroup;
  canEditFare = true;
  ReadOnlyPreFare = false;
  canEditPayTypeId = true;
  canEditDSC = false;
  maxPreFare40 = false;
  preFarePercent = 100;
  rewardPercent = 100;
  userBranchFareContract = "";
  totalFarePercent = 100;
  Fare40Percent: Number;
  maxReward: Number;
  factoryFare: number;
  drivers = [];
  trailers = [];
  senders = [];
  loadingLocations = [];
  targetBranchs = [];

  payTypesLoading = false;
  payTypes = [];
  payTypesInput$ = new Subject<string>();

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  receiversLoading = false;
  receivers$: Observable<Object | any[]>;
  receiversInput$ = new Subject<string>();
  readOnly = false;
  driversLoading = false;
  drivers$: Observable<Object | any[]>;
  driversInput$ = new Subject<string>();

  Accuser2: boolean;
  userBranchName;
  maxFare: number;

  showLttrNo = true;
  disabled = false;
  disableFare = false;
  isGete = false;

  maxLength: number;

  constructor(
    public dialogRef: MatDialogRef<AgendaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private agendaService: AgendaService,
    private fareService: FareService,
    private geteFareService: GeteFareService,
    public authService: AuthService
  ) {
    super();
    this.maxLength = 7;
    this.Accuser2 = this.authService.isAccUser;

    this.canEditFare = this.authService.isSuperAdmin || !this.data.isEdit;
    this.ReadOnlyPreFare = this.data.Agenda.isPreFarePaid ? true : (this.authService.isSuperAdmin && !this.authService.isAccAdmin) ? false : this.data.isEdit;
    this.authService.getUserBranches()
      .pipe(
        map(br => (br.filter(br => br.id == this.authService.selectedBranchId))))
      .subscribe(result => {
        this.maxPreFare40 = result[0]['maxPreFare40'];
        this.preFarePercent = result[0]['preFarePercent'];
        this.rewardPercent = result[0]['rewardPercent'];
        this.userBranchName = result[0]['title'];
        this.maxFare = result[0]['maxFare'];
        // this.userBranchFareContract = result[0]['fareContract'];
        console.log(result)


        // authService.getUserBranchName().subscribe(result => (this.User[] = result));
        //   this.authService.getUserBranchName().subscribe(res=> this.UserBranchName =res);
      });
    // this.UserBranchName = authService.getUserBranchName();
    // if (this.data.readOnly) {
    //   return;
    // }

    // this.getReceivers();
    // this.getDrivers();
    // this.getTrailers();

  }

  // ngAfterContentInit(): void {
  //   this.authService.getUserBranch().subscribe(res=> this.UserBranchName = res['name']);
  //   if (!(this.data.readOnly && this.authService.UserBranchName.includes('قطعه') )) {
  //     this.showTrailerCertForm();
  //   }
  // }
  // ngAfterViewInit(): void {

  // }

  get fareGroup() {
    return this.form.get('fareGroup');
  }
  ngOnInit(): void {
    if (!this.data.readOnly) {
      this.showTrailerCertForm();
    }
    this.readOnly = ['میثم', 'ذوالنوری', 'عظیمی', 'صادقی', 'فیروزه'].some(substring => this.authService.getFullName().includes(substring)) ? true :
      !this.data.readOnly && (this.authService.isSuperAdmin || !(this.data.isBodyTransAgenda || this.data.isAccUser))
    this.CreateForm();
    this.canEdit();
    this.getSenders();
    this.getLoadingLocations();
    this.getPayTypes();
    this.getBranchs();
    this.loadDrivers();
    this.loadReceivers();
    this.loadTrailers();
    // this.isGete = this.authService.selectedBranchNmae.includes('قطعه') || this.data.Agenda.branchName.includes('قطعه');
    this.disableFare = this.data.isMoved2Acc ? true : this.authService.isSuperAdmin ? false : this.data.isEdit ? true : (this.authService.selectedBranchId == 1 || this.authService.selectedBranchId == 8);
    this.formControlValueChanged();
    // if (this.data.Agenda.carCount != 6 || this.data.Agenda.carCount !=8) {
    //   this.showLttrNo = true;
    //   this.form.get('lttrrNo').setValidators(Validators.required);
    // } else {
    //   this.showLttrNo = false;
    //   this.form.get('lttrrNo').clearValidators();
    // }
    // this.form.get('lttrrNo').updateValueAndValidity();
  }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.targetBranchs = result));
  }
  showTrailerCertForm(): void {
    const cert = new TrailerCertDetailDto(null);
    const currentDate = moment();
    const dialogRef = this.dialog.open(TrailerCertDialog, {
      width: '550',
      height: '480',
      disableClose: true,
      data: {
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D  ساعت  HH:mm',
          showGoToCurrent: 'true'
        },
        Cert: cert,
        dialogTitle: 'ایجاد',
        isEdit: this.data.isEdit,
      }
    });
    dialogRef.afterClosed().subscribe(result1 => {
      if (result1 && result1.state === 'successful') {
        console.log(result1);
        this.form.get('description').patchValue(result1.certDsc);
        // this.form.get('driverId').patchValue(result1.driverId);
        // this.form.get('trailerId').patchValue(result1.trailerId);
        ///////////////
        // this.drivers$ =
        //   of([
        //     {
        //       id: result1.driverId,
        //       title: result1.driverName
        //     }
        //   ]);
        // this.trailers$ =
        //   of([
        //     {
        //       id: result1.trailerId,
        //       title: result1.trailerPlaque
        //     }
        //   ]);
        ////////////
      } else if (!this.data.isEdit) {
        this.dialogRef.close({ data: null, state: 'cancel' });
      }
    });
  }
  private CreateForm() {
    this.form = this.fb.group(
      {
        waybillNumber: [this.data.Agenda.waybillNumber, Validators.required],
        waybillSeries: [this.data.Agenda.waybillSeries, Validators.required],
        exportDate: [
          moment(this.data.Agenda.exportDate).locale('fa'),
          Validators.required
        ],
        receivedDate: this.data.Agenda.receivedDate,
        loadingLocationId: this.data.Agenda.loadingLocationId,
        receiverId: [this.data.Agenda.receiverId, Validators.required],
        fareContract: this.data.Agenda.fareContract == null ? this.data.fareContract : this.data.Agenda.fareContract,
        senderId: [this.data.Agenda.senderId, Validators.required],
        driverId: [this.data.Agenda.driverId, Validators.required],
        trailerId: [this.data.Agenda.trailerId, Validators.required],
        payTypeId: [this.data.Agenda.payTypeId, Validators.required],
        carCount: this.data.Agenda.carCount,
        lttrNo: this.data.Agenda.lttrNo,
        fareGroup: this.fb.group({
          fare: [this.data.Agenda.fare, Validators.required],
          preFare: this.data.Agenda.preFare,
          commision: this.data.Agenda.commision,
          milkRun: this.data.Agenda.milkRun,
          milkRunCount: this.data.Agenda.milkRunCount,
          reward: this.data.Agenda.reward
        },
          {
            validators: [this.checkPreFare.bind(this), this.checkReward.bind(this), this.checkMaxFare.bind(this)],
            updateOn: 'change'
          },
        ),
        remainingFare: this.data.Agenda.remainingFare,
        description: this.data.Agenda.description,
        isCashBill: this.data.Agenda.isCashBill,
        isDelivered: this.data.Agenda.isDelivered,
        cargoCode: this.data.Agenda.cargoCode,
        transTime: this.data.Agenda.transTime,
        distance: this.data.Agenda.distance,
        targetBranchId: this.data.Agenda.targetBranchId
      },
      { updateOn: 'blur' }
    );
    // if (this.data.isEdit && (!this.authService.isSuperAdmin))
    //   this.form.disable();
  }
  canEdit() {
    this.canEditPayTypeId = ['رسولی', 'نصیری', 'میثم', 'ذوالنوری', 'فرشادی'].some(substring => this.authService.getFullName().includes(substring));
  }
  canEditDSc() {
    this.canEditDSC = ['ذوالنوری', 'میثم', 'فهیمی'].some(substring => this.authService.getFullName().includes(substring));
  }
  // AddOrEditOrderItem(orderItemIndex, OrderID) {
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.disableClose = true;
  //   dialogConfig.width = "50%";
  //   dialogConfig.data = { orderItemIndex, OrderID };
  //   this.dialog.open(OrderItemsComponent, dialogConfig).afterClosed().subscribe(res => {
  //     this.updateGrandTotal();
  //   });
  // }
  popUpCalendar() {
    this.picker.open();
  }

  private loadDrivers() {
    this.drivers$ = concat(
      of([
        {
          id: this.data.Agenda.driverId,
          title: this.data.Agenda.driverTitle
        }
      ]),
      this.driversInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.driversLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/drivers/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.driversLoading = false))
          )
        )
      )
    );
  }

  private loadReceivers() {
    this.receivers$ = concat(
      of([
        {
          id: this.data.Agenda.receiverId,
          title: this.data.Agenda.receiverTitle
        }
      ]),
      this.receiversInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.receiversLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/agents/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.receiversLoading = false))
          )
        )
      )
    );
  }

  private loadTrailers() {
    this.trailers$ = concat(
      of([
        {
          id: this.data.Agenda.trailerId,
          title: this.data.Agenda.trailerTitle
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

  // getReceivers(): void {
  //   this.http
  //     .get('/v1/api/Lookup/agents')
  //     .subscribe(result => (this.receivers = Normalize(result)));
  // }

  // getDrivers(): void {
  //   this.http
  //     .get('/v1/api/Lookup/drivers')
  //     .subscribe(result => (this.drivers = Normalize(result)));
  // }

  // getTrailers(): void {
  //   this.http
  //     .get('/v1/api/Lookup/trailers')
  //     .subscribe(result => (this.trailers = Normalize(result)));
  // }

  getSenders(): void {
    this.http
      .get('/v1/api/Lookup/senders')
      .subscribe((result: ILookupResultDto[]) => (this.senders = result));
    // this.http.get("/v1/api/Lookup/senders").subscribe(result => this.senders = Normalize(result));
  }
  getLoadingLocations(): void {
    this.http
      .get('/v1/api/Lookup/loadingLocations')
      .subscribe((result: ILookupResultDto[]) => (this.loadingLocations = result));
    // this.http.get("/v1/api/Lookup/senders").subscribe(result => this.senders = Normalize(result));
  }
  getPayTypes(): void {
    this.http
      .get('/v1/api/Lookup/agendaPayTypes')
      .subscribe((result: ILookupResultDto[]) => (this.payTypes = result));
  }
  OnNgSelectKeyDown(event: any, type: string) {
    if (event.code === 'F4') {
      event.preventDefault();
      event.stopPropagation();
      if (type === 'driver') {
        this.onCreateDriver();
      } else if (type === 'trailer') {
        this.onCreateTrailer();
      } else if (type === 'receiver') {
        this.onCreateAgent();
      } else if (type === 'sender') {
        this.onSenderLookup();
      }
    } else if (event.code === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  onCreateAgent(): void {
    const dialogRef = this.dialog.open(AgentDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        Agent: new AgentDetailDto(null),
        dialogTitle: 'ایجاد',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
      }
    });
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
          // format: 'YY/M/D',
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

  onCreateDriver(): void {
    const dialogRef = this.dialog.open(DriverDialog, {
      width: '900px',
      height: '600px',
      disableClose: true,
      data: {
        Driver: new DriverDetailDto(null),
        dialogTitle: 'افزودن راننده جدید',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.trailersInput$ = result.data.selectedItem.trailerPlaque;
        this.data.Agenda.driverId = result.data.selectedItem.id;
        this.data.Agenda.trailerId = result.data.selectedItem.trailerId;
      }
    });
  }
  OnBlurCarCount() {
    // const carCount = this.form.get('carCount').value;
    // if (carCount < 6) {
    //   this.showLttrNo = true;
    //   this.form.get('lttrrNo').setValidators(Validators.required);
    // } else {
    //   this.showLttrNo = false;
    //   this.form.get('lttrrNo')?.clearValidators();
    // }
  }
  onBlurNumber(event): void {
    // let id = this.data.Agenda.driverId;
    // var driver = this.drivers.find(function (obj) {
    //   return obj.id === id;
    // });
    const trailerId = +event.alt;
    if (trailerId !== undefined && trailerId != null) {
      this.data.Agenda.trailerId = trailerId;
    }
  }

  incorrectCode(): void {
    this.snackBar.open('کد وارد شده اشتباه می باشد!', 'خطا', {
      duration: 3000,
      panelClass: ['snack-bar-info']
    });
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

  onSave(showAddCarToAgendaForm: boolean = true): void {
    if (this.form.valid || this.data.isEdit) {
      // this.disabled = true;
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });

      const agenda = JSON.stringify({
        WaybillNumber: this.form.get('waybillNumber').value,
        WaybillSeries: this.form.get('waybillSeries').value,
        ExportDate: moment
          .from(this.form.get('exportDate').value, 'en')
          .utc(true)
          .toJSON(),
        ReceivedDate: this.form.get('receivedDate').value,
        LoadingLocationId: this.form.get('loadingLocationId').value,
        ReceiverId: this.form.get('receiverId').value,
        SenderId: this.form.get('senderId').value,
        DriverId: this.form.get('driverId').value,
        TrailerId: this.form.get('trailerId').value,
        PayTypeId: this.form.get('payTypeId').value,
        LttrNo: this.form.get('lttrNo').value || 0,
        CarCount: this.form.get('carCount').value || 0,
        Fare: this.form.get('fareGroup.fare').value,
        PreFare: this.form.get('fareGroup.preFare').value,
        Commision: this.form.get('fareGroup.commision').value,
        MilkRun: this.form.get('fareGroup.milkRun').value,
        MilkRunCount: this.form.get('fareGroup.milkRunCount').value,
        Reward: this.form.get('fareGroup.reward').value,
        RemainingFare: this.form.get('remainingFare').value,
        Description: this.form.get('description').value,
        FareContract: this.form.get('fareContract').value,
        CargoCode: this.form.get('cargoCode').value,
        IsCashBill: this.form.get('isCashBill').value || 0,
        IsDelivered: this.data.Agenda.isDelivered || 0,
        BranchId: this.data.isEit ? this.data.Agenda.branchId : this.authService.selectedBranchId,
        TargetBranchId: this.form.get('targetBranchId').value,
        TransTime: this.form.get('transTime').value || 0,
        Distance: this.form.get('distance').value || 0
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getUrl() + this.data.Agenda.id, agenda, { headers: header })
          .subscribe(
            result => {
              const obj = {
                state: 'successful',
                waybillNumber: this.form.get('waybillNumber').value,
                waybillSeries: this.form.get('waybillSeries').value,
                id: result['entity'].id,
                showAddCarToAgendaForm: showAddCarToAgendaForm
              };
              // this.disabled = false;
              this.dialogRef.close(obj);

            },
            (error: any) => {
              // this.disabled = false;
              console.log('create agent');
              console.log(error);
            }
          );
      } else {
        this.http.post(this.getUrl(), agenda, { headers: header })
          .subscribe(
            result => {
              const obj = {
                state: 'successful',
                waybillNumber: this.form.get('waybillNumber').value,
                waybillSeries: this.form.get('waybillSeries').value,
                id: result['entity'].id,
                showAddCarToAgendaForm: showAddCarToAgendaForm
              };
              // this.disabled = false;
              this.dialogRef.close(obj);

            },
            (error: any) => {
              // this.disabled = false;
              console.log('create agent');
              console.log(error);
            }
          );
      }

      // if (this.data.Agenda.loadingLocationId)
      //   this.setItem(
      //     this.loadingLocationKey,
      //     this.data.Agenda.loadingLocationId
      //   );
    }
  }
  onShowList(showAddCarToAgendaForm: boolean = true) {
    const obj = {
      state: 'successful',
      waybillNumber: this.form.get('waybillNumber').value,
      waybillSeries: this.form.get('waybillSeries').value,
      id: this.data.Agenda.id,
      showAddCarToAgendaForm: showAddCarToAgendaForm
    };
    // this.disabled = false;
    this.dialogRef.close(obj);
  }
  onSenderLookup(): void {
    const dialogRef = this.dialog.open(CarManufacturerLookup, {
      width: '600px',
      height: '600px',
      disableClose: true,
      data: {
        dialogTitle: 'انتخاب فرستنده',
        selectedItem: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.data.selectedItem) {
        this.getSenders();
        this.data.Agenda.senderId = result.data.selectedItem.id;
      }
    });
  }

  formControlValueChanged() {
    const fareContract$ = this.form.get('fareContract').valueChanges;
    const receiverId$ = this.form.get('receiverId').valueChanges;
    const carCount$ = this.form.get('carCount').valueChanges;
    const fareGroup$ = this.form.get('fareGroup').valueChanges;
    // const preFare$ = this.form.get('fareGroup.preFare').valueChanges;
    // const reward$ = this.form.get('fareGroup.reward').valueChanges;
    fareGroup$.subscribe(() => {
      const fare = +this.form.get('fareGroup.fare').value;
      const preFare = +this.form.get('fareGroup.preFare').value;
      const commision = +this.form.get('fareGroup.commision').value;
      const reward = +this.form.get('fareGroup.reward').value;
      const milkRun = +this.form.get('fareGroup.milkRun').value;
      this.form.get('remainingFare').setValue(fare + reward + milkRun - preFare);

      // this.form.get('fareGroup.remainingFare').updateValueAndValidity();
    });


    // const remainingFare$ = this.form.get('remainingFare').valueChanges;
    // remainingFare$.subscribe(()=>{
    //   this.checkTotalFare(this.form.get('fareGroup').value);
    // });
    const driverId$ = this.form.get('driverId').valueChanges;
    driverId$.subscribe(() => {
      const driverId = this.form.get('driverId').value;
      // if (this.form.get('trailerId').value === null) {
      this.http
        .get<DriverDetailDto>(`/v1/api/Driver/${driverId}`)
        .subscribe(result => {
          const driver = new DriverDetailDto(result['entity']);

          if (driver.trailerId > 0) {
            this.trailers$ = of([
              {
                id: driver.trailerId,
                title: driver.trailerPlaque
              }
            ]);
            this.form.get('trailerId').setValue(driver.trailerId);
          }
        });
      // }
    });
    receiverId$.subscribe(() => {
      const receiverId = this.form.get('receiverId').value;
      const senderId = this.form.get('senderId').value;
      this.http
        .get<any>(`/v1/api/Distance/GetTransTime/${senderId}?receiverId=${receiverId}`) // 
        .subscribe(result => {
          const transTime = result['transTime'];
          const distance = result['distance'];

          if (transTime !== '') {

            this.form.get('transTime').setValue(transTime);
            this.form.get('distance').setValue(distance);
          }
        });
    });


    if (!this.data.isGete) {
      merge(receiverId$, fareContract$, carCount$).subscribe(() => {
        const agentId = this.form.get('receiverId').value;
        const contractNo = this.form.get('fareContract').value;
        const carCount = this.form.get('carCount').value;

        if (carCount > 0 && agentId > 0 && contractNo != null) {
          this.fareService
            .getAgendaFare(contractNo, agentId)
            .subscribe((result: FareDto) => {
              const fare = carCount > 6 ? result.fare8 : result.fare6;

              this.factoryFare = result.factoryFare * carCount;
              if (carCount < 6) this.form.get('lttrrNo').updateValueAndValidity();
              this.form.get('fareGroup.fare').setValue(fare);
              if (!this.data.isEdit) {
                this.form.get('fareGroup.preFare').setValue(result.preFare);
                this.form.get('fareGroup.preFare').updateValueAndValidity();
              }
            });
        }
      });
      // console.log("aaaaaaa")
    }
    // if (!(this.authService.selectedBranchNmae.includes('قطعه') || this.data.Agenda.branchName.includes('قطعه')))  {
    else {
      const loadingLocationId$ = this.form.get('loadingLocationId').valueChanges;
      const senderId$ = this.form.get('senderId').valueChanges;
      const trailerId$ = this.form.get('trailerId').valueChanges;

      merge(receiverId$, fareContract$, loadingLocationId$, senderId$, trailerId$).subscribe(() => {

        const loadingLocationId = this.form.get('loadingLocationId').value;
        const senderId = this.form.get('senderId').value;
        const fareContract = this.form.get('fareContract').value;
        const receiverId = this.form.get('receiverId').value;
        const trailerId = this.form.get('trailerId').value;

        if (receiverId > 0 && fareContract != null && loadingLocationId > 0 && senderId > 0 && trailerId > 0)
          this.geteFareService
            .getGeteFare(receiverId, trailerId, fareContract, loadingLocationId, senderId, 0, 0)
            // .subscribe(res => console.log(res));
            .subscribe((result: GeteFareDto) => {

              this.form.get('fareGroup.fare').setValue(result.fare);
            });
      });
    }

  }

  // checkPreFare(group: FormGroup) {
  //   const fare = group.controls['fare'];
  //   const preFare = group.controls['preFare'];
  //   const reward = group.controls['reward'];
  //   if (Number(fare.value) + Number(reward.value) < Number(preFare.value)) {
  //     preFare.setErrors({ perFareAlert: true });
  //   }
  //   return null;
  // }
  checkMaxFare(group: FormGroup): ValidationErrors | null {
    const fare = group.controls['fare'];
    if (Number(fare.value) > this.maxFare) {
      return { checkMaxFare: true };
    } 
    return null;
  }
  checkPreFare(group: FormGroup): ValidationErrors | null {
    const fare = group.controls['fare'];
    const preFare = group.controls['preFare'];
    const milkRun = group.controls['milkRun'];
    const reward = group.controls['reward'];
    this.Fare40Percent = Math.round((Number(fare.value) + Number(reward.value)) * this.preFarePercent / 100);
    if (Number(fare.value) + Number(reward.value) + Number(milkRun.value) < Number(preFare.value)) {
      return { checkPreFare: true };
    } else if (!this.authService.isSuperAdmin && this.maxPreFare40 && (+preFare.value > +this.Fare40Percent)) {
      return { moreThan40Fare: true };
    }
    return null;
  }
  checkTotalFare(group: FormGroup): ValidationErrors | null {
    if (this.totalFarePercent > 0 || this.totalFarePercent != undefined) {
      const fare = group.controls['fare'];
      const milkRun = group.controls['milkRun'];
      const reward = group.controls['reward'];

      const totalFare = Math.round((Number(fare.value) + Number(reward.value) + Number(milkRun.value)));

      if (totalFare > this.factoryFare * this.totalFarePercent / 100) {
        return { checkTotalFare: true };
      }
      // else if (!this.authService.isSuperAdmin && this.maxPreFare40 && (+preFare.value > +this.Fare40Percent)) {
      //   return { moreThan40Fare: true };
      // }
      return null;

    }
  }
  checkReward(group: FormGroup): ValidationErrors | null {
    const fare = group.controls['fare'];
    const reward = group.controls['reward'];
    this.maxReward = Math.round((Number(fare.value)) * this.rewardPercent / 100);
    if (!this.authService.isSuperAdmin && Number(reward.value) > (Number(fare.value) * this.rewardPercent / 100)) {
      return { checkReward: true };
    }
    return null;
  }
  getUrl() {
    return '/v1/api/Agenda/';
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }
}
