import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormComponent } from './form.component';
import { FixSentenceComponent } from './fix-sentence/fix-sentence.component';
import { LoadingLocationComponent } from './loading-location/loading-location.component';
import { GeteLoadingLocationComponent } from './gete-loading-location/gete-loading-location.component';
import { GeteManufacturerComponent } from './gete-manufacturer/gete-manufacturer.component';
import { CarGroupComponent } from './car-group/car-group.component';
import { TrailerBuilderComponent } from './trailer-builder/trailer-builder.component';
import { TrailerComponent } from './trailer/trailer.component';
import { TrailerOwnerTypeComponent } from './trailer-owner-type/trailer-owner-type.component';
import { TonnageTypeComponent } from './tonnage-type/tonnage-type.component';
import { CarTypeComponent } from './car-type/car-type.component';
import { CarManufacturerGroupComponent } from './car-manufacturer-group/car-manufacturer-group.component';
import { CarManufacturerComponent } from './car-manufacturer/car-manufacturer.component';
import { AgentComponent } from './agent/agent.component';
import { AgendaComponent } from './agenda/agenda.component';
import { CarComponent } from './car/car.component';
import { GisComponent } from './gis/gis.component';
import { DriverComponent } from './driver/driver.component';
import { ProvinceComponent } from './province/province.component';
import { CityComponent } from './city/city.component';
import { ShippingCompanyComponent } from './shipping-company/shipping-company.component';
import { DeliveryWaybillComponent } from './delivery-waybill/delivery-waybill.component';
import { EntranceFromComponent } from './entrance-from/entrance-from.component';
import { BankComponent } from './bank/bank.component';
import { PersonComponent } from './person/person.component';
import { PayTypeComponent } from './pay-type/pay-type.component';
import { BankAccountComponent } from './bank-account/bank-account.component';
import { BranchComponent } from './branch/branch.component';
import { ReportViewerComponent } from './report/report-viewer.component';
import { FormAuthGuardService } from '../core/services/form-auth-guard.service';
import { FareComponent } from './fare/fare.component';
import { AmaniComponent } from "./amani/amani.component";
import { RecurrentCarComponent } from './recurrent-car/recurrent-car.component';
import { SubsidyComponent } from './subsidy/subsidy.component';
import { PackagingComponent } from './packaging/packaging.component';
import { GoodsComponent } from './goods/goods.component';
import { PaidCashInvoiceComponent } from './invoice/paid-cash-invoice.component';
import { AgendaPayTypeComponent } from './agenda-pay-type/agenda-pay-type.component';
import { OutTransTimeComponent } from './agenda/out-trans-time.component';
import { ChaqueComponent } from './chaque/chaque.component';
import { FactoryFareComponent } from './factory-fare/factory-fare.component';
import { TrailerCertItemComponent } from './trailer-cert-item/trailer-cert-item.component';
import { TrailerCertComponent } from './trailer-cert/trailer-cert.component';
import { KafComponent } from './kaf/kaf.component';
import { KafRentPaidComponent } from './kaf-rent-paid/kaf-rent-paid.component';
import { DriverAttendComponent } from './driverAttend/driverAttend.component';
import { PenaltyComponent } from './penalty/penalty.component';
import { DriverPenaltyItemComponent } from './driver-penalty-item/driver-penalty-item.component';
import { TrailerActivityComponent } from './trailer-activity/trailer-activity.component';
import { TargetBranchComponent } from './agenda/target-branch.component';
import { CashDepositComponent } from './cash-deposit/cash-deposit.component';
import { AccessoryComponent } from './accessory/accessory.component';
import { DriverAccessoryComponent } from './driver-accessory/driver-accessory.component';
import { DriverFactorComponent } from './driver-factor/driver-factor.component';
import { TankhahComponent } from './tankhah/tankhah.component';
import { WarrantyComponent } from './warranty/warranty.component';
import { BillTypeComponent } from './bill-type/bill-type.component';
import { BillComponent } from './bill/bill.component';
import { ReplaceTrailerComponent } from './replace-trailer/replace-trailer.component';
import { ActivityComponent } from './trailer-activity/activity.component';
import { TrailerBranchComponent } from './trailer-activity/TrailerBranch/trailer-branch.component';
import { PostComponent } from './post/post.component';
import { MessageComponent } from './message/message.component';
import { InvalidAgendaComponent } from './invalid-agenda/invalid-agenda.component';
// import { Ng2FileUploadComponent } from './UploadFile/ng2-file-upload/ng2-file-upload.component';
import { TrailerFareComponent } from './trailer-fare/trailer-fare.component';
import { SofteComponent } from './softe/softe.component';
import { ConsumerItemComponent } from './consumer-item/consumer-item.component';
import { UploadComponent } from './UploadFile/upload.component';
import { GeteFareComponent } from './gete-fare/gete-fare.component';
import { GeteZoneComponent } from './gete-zone/gete-zone.component';
import { GeteManufacturerZoneComponent } from './gete-manufacturer-zone/gete-manufacturer-zone.component';
import { IssicoNameComponent } from './issico-name/issico-name.component';
import { TruckLoanComponent } from './truck-loan/truck-loan.component';
import { HavaleComponent } from './Havale/havale.component';
import { CargoComponent } from './cargo/cargo.component';
import { DailyOperationComponent } from './daily-operation/daily-operation.component';

const routes: Routes = [
  { path: '', component: FormComponent, canActivate: [FormAuthGuardService] },
  {
    path: 'upload',
    component: UploadComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'trailerfare',
    component: TrailerFareComponent,
    canActivate: [FormAuthGuardService]
  }, {
    path: 'consumeritem',
    component: ConsumerItemComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'bill',
    component: BillComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'paytype',
    component: PayTypeComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'billtype',
    component: BillTypeComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'issiconame',
    component: IssicoNameComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'cargo',
    component: CargoComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'truckLoans',
    component: TruckLoanComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'agendapaytype',
    component: AgendaPayTypeComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'warranty',
    component: WarrantyComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'tankhah',
    component: TankhahComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'cashdeposit',
    component: CashDepositComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'driverfactor',
    component: DriverFactorComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'softe',
    component: SofteComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'outtranstime',
    component: OutTransTimeComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'driveraccessory',
    component: DriverAccessoryComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'targetbranch',
    component: TargetBranchComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'accessory',
    component: AccessoryComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'factoryfare',
    component: FactoryFareComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'havale',
    component: HavaleComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'chaque',
    component: ChaqueComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'post',
    component: PostComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'message',
    component: MessageComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'trailercertitem',
    component: TrailerCertItemComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'invalidagenda',
    component: InvalidAgendaComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'driverpenaltyitem',
    component: DriverPenaltyItemComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'traileractivity',
    component: TrailerActivityComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'trailerbranch',
    component: TrailerBranchComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'activity',
    component: ActivityComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'replacetrailer',
    component: ReplaceTrailerComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'kaf',
    component: KafComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'kafrentpaid',
    component: KafRentPaidComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'trailercert',
    component: TrailerCertComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'person',
    component: PersonComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'bank',
    component: BankComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'bankaccount',
    component: BankAccountComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'dailyOperation',
    component: DailyOperationComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'branch',
    component: BranchComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'report',
    component: ReportViewerComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'fixsentence',
    component: FixSentenceComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'cargroup',
    component: CarGroupComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'packaging',
    component: PackagingComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'loadinglocation',
    component: LoadingLocationComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'geteloadinglocation',
    component: GeteLoadingLocationComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'getemanufacturer',
    component: GeteManufacturerComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'getemanufacturerzone',
    component: GeteManufacturerZoneComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'getezone',
    component: GeteZoneComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'getefare',
    component: GeteFareComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'goods',
    component: GoodsComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'trailerbuilder',
    component: TrailerBuilderComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'trailer',
    component: TrailerComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'trailerownertype',
    component: TrailerOwnerTypeComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'tonnagetype',
    component: TonnageTypeComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'cartype',
    component: CarTypeComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'agent',
    component: AgentComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'fare',
    component: FareComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'agenda',
    component: AgendaComponent,
    canActivate: [FormAuthGuardService]
  },
  { path: 'car', component: CarComponent, canActivate: [FormAuthGuardService] },
  { path: 'recurrentcar', component: RecurrentCarComponent, canActivate: [FormAuthGuardService] },
  {
    path: 'driver',
    component: DriverComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'subsidy',
    component: SubsidyComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'driverAttend',
    component: DriverAttendComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'penalty',
    component: PenaltyComponent,
    canActivate: [FormAuthGuardService]
  },
  { path: 'gis', component: GisComponent, canActivate: [FormAuthGuardService] },
  {
    path: 'province',
    component: ProvinceComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'city',
    component: CityComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'shippingcompany',
    component: ShippingCompanyComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'deliverywaybill',
    component: DeliveryWaybillComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'entrancefrom',
    component: EntranceFromComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'amani',
    component: AmaniComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'carManufacturergroup',
    component: CarManufacturerGroupComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'carManufacturer',
    component: CarManufacturerComponent,
    canActivate: [FormAuthGuardService]
  },
  {
    path: 'PaidCashInvoice',
    component: PaidCashInvoiceComponent,
    canActivate: [FormAuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormRoutingModule { }
