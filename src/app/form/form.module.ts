import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormRoutingModule } from './form-routing.module';
import { FormComponent } from './form.component';
import { SharedModule } from '../shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { MaterialModule } from './material.module';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule
} from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { HttpErrorInterceptor } from '../shared/http-interceptor';
import { DpDatePickerModule } from 'ng2-jalali-date-picker';

import { FixSentenceComponent } from './fix-sentence/fix-sentence.component';
import { FixSentenceDialog } from './fix-sentence/fix-sentence.dialog';
import { FixSentenceLookupComponent } from './lookups/fix-sentence/fix-sentence-lookup.dialog';

import { LoadingLocationComponent } from './loading-location/loading-location.component';
import { LoadingLocationDialog } from './loading-location/loading-location.dialog';
import { LoadingLocationLookupComponent } from './lookups/loading-location/loading-location-lookup.dialog';

import { GeteLoadingLocationComponent } from './gete-loading-location/gete-loading-location.component';
import { GeteLoadingLocationDialog } from './gete-loading-location/gete-loading-location.dialog';

import { GeteManufacturerComponent } from './gete-manufacturer/gete-manufacturer.component';
import { GeteManufacturerDialog } from './gete-manufacturer/gete-manufacturer.dialog';

import { GeteZoneComponent } from './gete-zone/gete-zone.component';
import { GeteZoneDialog } from './gete-zone/gete-zone.dialog';

import { EntranceFromComponent } from './entrance-from/entrance-from.component';
import { EntranceFromDialog } from './entrance-from/entrance-from.dialog';
import { EntranceFromLookup } from './lookups/entrance-from/entrance-from-lookup.dialog';

import { TrailerBuilderComponent } from './trailer-builder/trailer-builder.component';
import { TrailerBuilderDialog } from './trailer-builder/trailer-builder.dialog';
import { TrailerBuilderLookupComponent } from './lookups/trailer-builder/trailer-builder-lookup.dialog';

import { TrailerComponent } from './trailer/trailer.component';
import { TrailerDialog } from './trailer/trailer.dialog';
import { TrailerLookup } from './lookups/trailer/trailer-lookup.dialog';

import { ProvinceLookup } from './lookups/province/province-lookup.dialog';
import { CityLookupComponent } from './lookups/city/city-lookup.dialog';
import { CarManufacturerGroupLookup } from './lookups/car-manufacturer-group/car-manufacturer-group-lookup.dialog';
import { CarManufacturerLookup } from './lookups/car-manufacturer/car-manufacturer-lookup.dialog';

import { TrailerOwnerTypeComponent } from './trailer-owner-type/trailer-owner-type.component';
import { TrailerOwnerTypeDialog } from './trailer-owner-type/trailer-owner-type.dialog';
import { TrailerOWnerTypeLookup } from './lookups/trailer-owner/trailer-owner-lookup.dialog';

import { TonnageTypeComponent } from './tonnage-type/tonnage-type.component';
import { TonnageTypeDialog } from './tonnage-type/tonnage-type.dialog';
import { TonnageTypeLookupComponent } from './lookups/tonnage-type/tonnage-type-lookup.dialog';

import { CarManufacturerGroupComponent } from './car-manufacturer-group/car-manufacturer-group.component';
import { CarManufacturerGroupDialog } from './car-manufacturer-group/car-manufacturer-group.dialog';

import { CarManufacturerComponent } from './car-manufacturer/car-manufacturer.component';
import { CarManufacturerDialog } from './car-manufacturer/car-manufacturer.dialog';

import { CarTypeComponent } from './car-type/car-type.component';
import { CarTypeDialog } from './car-type/car-type.dialog';
import { CarTypeLookupComponent } from './lookups/car-type/car-type-lookup.dialog';
import { CarTypeService } from './car-type/car-type.service';

import { GoodsComponent } from './goods/goods.component';
import { GoodsDialog } from './goods/goods.dialog';
import { GoodsService } from './goods/goods.service';

import { CarGroupComponent } from './car-group/car-group.component';
import { CarGroupDialog } from './car-group/car-group.dialog';
import { CarGroupLookup } from './lookups/car-group/car-group-lookup.dialog';
import { CarGroupService } from './car-group/car-group.service';

import { DriverComponent } from './driver/driver.component';
import { DriverDialog } from './driver/driver.dialog';
import { DriverLookup } from './lookups/driver/driver-lookup.dialog';


import { InlineAddCarToAgenda } from './agenda/inline-add-car-to-agenda';
import { AgendaComponent } from './agenda/agenda.component';
import { AgendaDialog } from './agenda/agenda.dialog';
import { AgendaCarToAgendaDialog } from './agenda/add-car-to-agenda';
import { AgendaSetReceipt } from './agenda/agenda-set-receipt.dialog';
import { AgendaMoved2AccDialog } from './agenda/agenda-move-acc.dialog';
import { AgendaSetReceiptGroup } from './agenda/agenda-set-receipt-group.dialog';
import { SetReceiptFoeEternalAgenda } from './agenda/set-receipt-for-external-agenda.dialog';
import { AgendaService } from './agenda/agenda.service';
import { InvoiceAgendaComponent } from './invoice/invoice-agenda.component';

import { AgentComponent } from './agent/agent.component';
import { AgentDialog } from './agent/agent.dialog';
import { AgentLookup } from './lookups/agent/agent-lookup.dialog';
import { AgentService } from './agent/agent.service';

import { CarComponent } from './car/car.component';
import { CarDialog } from './car/car.dialog';
import { ExitCarDialog } from './car/exit-car.dialog';
import { CarLookupDialog } from './lookups/car/car-lookup.dialog';
import { CarService } from './car/car.service';

import { ProvinceComponent } from './province/province.component';
import { ProvinceDialog } from './province/province.dialog';

import { CityComponent } from './city/city.component';
import { CityDialog } from './city/city.dialog';

import { DeliveryWaybillComponent } from './delivery-waybill/delivery-waybill.component';
import { DeliveryWaybillDialog } from './delivery-waybill/delivery-waybill.dialog';

import { GisComponent } from './gis/gis.component';

import { ShippingCompanyComponent } from './shipping-company/shipping-company.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ExcelModule, GridModule } from '@progress/kendo-angular-grid';
import { MessageService } from '@progress/kendo-angular-l10n';
import '@progress/kendo-angular-intl/locales/fa/all';
import { KendoMessageService } from '../shared/services/kendo-message.service';
import { GridService } from '../shared/services/grid.service';
import { RouterModule } from '@angular/router';
import { ChakavakCurrency } from '../shared/pipes/chakavak.currency.pipe';
import { PayTypeComponent } from './pay-type/pay-type.component';
import { PayTypeDialog } from './pay-type/pay-type.dialog';
import { AgendaPayTypeComponent } from './agenda-pay-type/agenda-pay-type.component';
import { AgendaPayTypeDialog } from './agenda-pay-type/agenda-pay-type.dialog';
import { BankDialog } from './bank/bank.dialog';
import { BankComponent } from './bank/bank.component';
import { BankAccountDialog } from './bank-account/bank-account.dialog';
import { BankAccountComponent } from './bank-account/bank-account.component';
import { BankLookup } from './lookups/bank/bank-lookup.dialog';
import { BranchComponent } from './branch/branch.component';
import { BranchDialog } from './branch/branch.dialog';
import { BranchLookup } from './lookups/branch/branch-lookup.dialog';
import { ReportViewerComponent } from './report/report-viewer.component';
import { DropDownsModule, DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { ChakavakEventsBus } from '../core/services/EventBus/chakavak-event-bus';
import { PersonComponent } from './person/person.component';
import { PersonBankAccountComponent } from './person-bank-account/person-bank-account.component';
import { PersonLookup } from './lookups/person/person-lookup.dialog';
import { AddUserToPersonDialog } from './person/add-user-to-person.dialog';
import { ContactDialog } from './person/contact.dialog';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { ToolBarModule } from '@progress/kendo-angular-toolbar';
import { ContextMenuModule } from '@progress/kendo-angular-menu';
import { FareComponent } from './fare/fare.component';
import { FareDialog } from './fare/fare.dialog';
import { FareService } from './fare/fare.service';
import { GeteFareComponent } from './gete-fare/gete-fare.component';
import { GeteFareDialog } from './gete-fare/gete-fare.dialog';
import { GeteFareService } from './gete-fare/gete-fare.service';
import { AmaniDialog } from './amani/amani.dialog';
// import { UiSwitchModule } from 'ngx-toggle-switch';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { RecurrentCarComponent } from './recurrent-car/recurrent-car.component';
import { RecurrentCarDialog } from './recurrent-car/recurrent-car.dialog';
import { AmaniComponent } from './amani/amani.component';
import { SubsidyComponent } from './subsidy/subsidy.component';
import { SubsidyDialog } from './subsidy/subsidy.dialog';
import { PackagingDialog } from './packaging/packaging.dialog';
import { PackagingComponent } from './packaging/packaging.component';
import { PackagingService } from './packaging/packaging.service';
import { AutoPartsDialog } from './auto-parts/auto-parts.dialog';
import { AutoPartsService } from './auto-parts/auto-parts.service';
import { PopupModule } from '@progress/kendo-angular-popup';
import { PaidCashInvoiceDialog } from './invoice/paid-cash-invoice.dialog';
import { PaidCashInvoiceComponent } from './invoice/paid-cash-invoice.component';
import { InvoiceService } from './invoice/invoice.service';
import { InvoiceRecarComponent } from './invoice/invoice-recar.component';
import { InvoiceAmaniComponent } from './invoice/invoice-amani.component';
import { InvoiceSubsidyComponent } from './invoice/invoice-subsidy.component';
import { InvoiceSearchDialogComponent } from './invoice/search-dialog.component';
import { ResponsiveService } from '../shared/services/responsive.service';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { IntlModule } from '@progress/kendo-angular-intl';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { OutTransTimeDialog } from './agenda/out-trans-time.dialog';
import { OutTransTimeComponent } from './agenda/out-trans-time.component';
import { ChaqueComponent } from './chaque/chaque.component';
import { ChaqueDialog } from './chaque/chaque.dialog';
import { FactoryFareDialog } from './factory-fare/factory-fare.dialog';
import { FactoryFareComponent } from './factory-fare/factory-fare.component';
import { TrailerCertItemDialog } from './trailer-cert-item/trailer-cert-item.dialog';
import { TrailerCertItemComponent } from './trailer-cert-item/trailer-cert-item.component';
import { TrailerCertDialog } from './trailer-cert/trailer-cert.dialog';
import { TrailerCertComponent } from './trailer-cert/trailer-cert.component';
import { KafDialog } from './kaf/kaf.dialog';
import { KafComponent } from './kaf/kaf.component';
import { InvoiceKafComponent } from './invoice/invoice-kaf.component';
import { KafRentPaidDialog } from './kaf-rent-paid/kaf-rent-paid.dialog';
import { KafRentPaidComponent } from './kaf-rent-paid/kaf-rent-paid.component';
import { InvoiceChaqueComponent } from './invoice/invoice-chaque.component';
import { DriverAttendDialog } from './driverAttend/driverAttend.dialog';
import { DriverAttendComponent } from './driverAttend/driverAttend.component';
import { PenaltyDialog } from './penalty/penalty.dialog';
import { PenaltyComponent } from './penalty/penalty.component';
import { InvoicePenaltyComponent } from './invoice/invoice-penalty.component';
import { DriverPenaltyItemComponent } from './driver-penalty-item/driver-penalty-item.component';
import { DriverPenaltyItemDialog } from './driver-penalty-item/driver-penalty-item.dialog';
import { HavaleComponent } from './Havale/havale.component';
import { HavaleDialog } from './Havale/havale.dialog';
import { InvoiceHavaleComponent } from './invoice/invoice-havale.component';
import { TargetBranchComponent } from './agenda/target-branch.component';
import { CashDepositComponent } from './cash-deposit/cash-deposit.component';
import { AccessoryComponent } from './accessory/accessory.component';
import { AccessoryDialog } from './accessory/accessory.dialog';
import { AccessoryService } from './accessory/accessory.service';
import { DriverAccessoryComponent } from './driver-accessory/driver-accessory.component';
import { DriverAccessoryDialog } from './driver-accessory/driver-accessory.dialog';
import { InvoiceAccessoryComponent } from './invoice/invoice-accessory.component';
import { CashDepositDialog } from './cash-deposit/cash-deposit.dialog';
import { DriverFactorComponent } from './driver-factor/driver-factor.component';
import { DriverFactorDialog } from './driver-factor/driver-factor.dialog';
import { InvoiceFactorComponent } from './invoice/invoice-factor.component';
import { TankhahComponent } from './tankhah/tankhah.component';
import { TankhahDialog } from './tankhah/tankhah.dialog';
import { WarrantyComponent } from './warranty/warranty.component';
import { WarrantyDialog } from './warranty/warranty.dialog';
import { BillTypeDialog } from './bill-type/bill-type.dialog';
import { BillTypeComponent } from './bill-type/bill-type.component';
import { BillDialog } from './bill/bill.dialog';
import { BillComponent } from './bill/bill.component';
import { TrailerActivityComponent } from './trailer-activity/trailer-activity.component';
import { ReplaceTrailerComponent } from './replace-trailer/replace-trailer.component';
import { ReplaceTrailerDialog } from './replace-trailer/replace-trailer.dialog';
import { ActivityComponent } from './trailer-activity/activity.component';
import { InvoiceReplaceComponent } from './invoice/invoice-replace.component';
import { TrailerBranchComponent } from './trailer-activity/TrailerBranch/trailer-branch.component';
import { PostComponent } from './post/post.component';
import { PostDialog } from './post/post.dialog';
import { MessageComponent } from './message/message.component';
import { MessageDialog } from './message/message.dialog';
import { InvalidAgendaComponent } from './invalid-agenda/invalid-agenda.component';
import { InvalidAgendaDialog } from './invalid-agenda/invalid-agenda.dialog';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { FileUploadModule } from "ng2-file-upload";

// import { Ng2FileUploadComponent } from './UploadFile/ng2-file-upload/ng2-file-upload.component';
// import { UploadService } from './UploadFile/ng2-file-upload/upload.service';
import { TrailerFareComponent } from './trailer-fare/trailer-fare.component';
import { TrailerFareDialog } from './trailer-fare/trailer-fare.dialog';
import { TrailerFareService } from './trailer-fare/trailer-fare.service';
import { SofteDialog } from './softe/softe.dialog';
import { SofteComponent } from './softe/softe.component';
import { InvoiceSofteComponent } from './invoice/invoice-softe.component';
import { ConsumerItemService } from './consumer-item/consumer-item.service';
import { ConsumerItemComponent } from './consumer-item/consumer-item.component';
import { ConsumerItemDialog } from './consumer-item/consumer-item.dialog';
import { UploadComponent } from './UploadFile/upload.component';
import { NumberToPersianPipe } from '../shared/pipes/number-to-persian.pipe';
import { JalaliPipe } from '../shared/pipes/jalali.pipe';
import { GeteManufacturerZoneComponent } from './gete-manufacturer-zone/gete-manufacturer-zone.component';
import { GeteManufacturerZoneDialog } from './gete-manufacturer-zone/gete-manufacturer-zone.dialog';
import { AgendaMove2AccGroupDialog } from './agenda/agenda-move2acc-group.dialog';
import { IssicoNameComponent } from './issico-name/issico-name.component';
import { IssicoNameDialog } from './issico-name/issico-name.dialog';
import { TruckLoanComponent } from './truck-loan/truck-loan.component';
import { TruckLoanDialog } from './truck-loan/truck-loan.dialog';
import { CargoComponent } from './cargo/cargo.component';
import { CargoDialog } from './cargo/cargo.dialog';
import { FileUploadInputModule } from './amani/file-upload/file-upload.module';
import { ImportFromExcelDialog } from './agenda/import-from-excel.dialog';
import { DailyOperationDialog } from './daily-operation/daily-operation.dialog';
import { DailyOperationComponent } from './daily-operation/daily-operation.component';
import { ChangeAgendaBranch } from './agenda/change-agenda-branch.dialog';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [

    // BrowserAnimationsModule,
    NotificationModule,
    LayoutModule,
    ContextMenuModule,
    TooltipModule,
    // UiSwitchModule,
    ButtonsModule,
    DropDownsModule,
    DropDownListModule,
    PopupModule,
    CommonModule,
    FormRoutingModule,
    SharedModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    GridModule,
    ToolBarModule,
    IntlModule,
    DateInputsModule,
    ExcelModule,
    RouterModule,
    FileUploadModule,
    FileUploadInputModule,
    // NgxMaskModule.forRoot(),
    DpDatePickerModule,
    // TreeModule,
    // NgbModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    // UploadService,
    ResponsiveService,
    InvoiceService,
    AgendaService,
    AgentService,
    AutoPartsService,
    FareService,
    GeteFareService,
    TrailerFareService,
    CarService,
    CarGroupService,
    PackagingService,
    CarTypeService,
    GoodsService,
    ConsumerItemService,
    AccessoryService,
    ChakavakEventsBus,
    GridService,
    NumberToPersianPipe,
    JalaliPipe,
    ChakavakCurrency,

    { provide: MessageService, useValue: true },
    { provide: MessageService, useClass: KendoMessageService },
    {
      provide: LOCALE_ID,
      useValue: 'fa'
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    }
  ],
  entryComponents: [
    TrailerFareComponent,
    TrailerFareDialog,
    CargoComponent,
    CargoDialog,
    UploadComponent,
    ActivityComponent,
    ReplaceTrailerComponent,
    ReplaceTrailerDialog,
    BillComponent,
    BillDialog,
    BillTypeDialog,
    BillTypeComponent,
    IssicoNameComponent,
    IssicoNameDialog,
    WarrantyComponent,
    WarrantyDialog,
    TankhahComponent,
    TankhahDialog,
    MessageComponent,
    MessageDialog,
    InvoiceFactorComponent,
    InvoiceSofteComponent,
    DriverFactorComponent,
    DriverFactorDialog,
    TruckLoanComponent,
    TruckLoanDialog,
    SofteComponent,
    SofteDialog,
    InvalidAgendaComponent,
    InvalidAgendaDialog,
    DriverAccessoryComponent,
    DriverAccessoryDialog,
    AccessoryComponent,
    AccessoryDialog,
    CashDepositComponent,
    CashDepositDialog,
    TargetBranchComponent,
    HavaleComponent,
    HavaleDialog,
    TrailerActivityComponent,
    TrailerBranchComponent,
    InvoiceChaqueComponent,
    KafDialog,
    KafComponent,
    KafRentPaidDialog,
    KafRentPaidComponent,
    TrailerCertDialog,
    TrailerCertComponent,
    TrailerCertItemDialog,
    TrailerCertItemComponent,
    DriverPenaltyItemDialog,
    DriverPenaltyItemComponent,
    FactoryFareDialog,
    FactoryFareComponent,
    ChaqueDialog,
    ChaqueComponent,
    OutTransTimeComponent,
    OutTransTimeDialog,
    PaidCashInvoiceComponent,
    InvoiceSearchDialogComponent,
    AutoPartsDialog,
    PaidCashInvoiceDialog,
    RecurrentCarComponent,
    RecurrentCarDialog,
    PayTypeDialog,
    PayTypeComponent,
    AgendaPayTypeDialog,
    AgendaPayTypeComponent,
    ContactDialog,
    AddUserToPersonDialog,
    PersonComponent,
    PersonLookup,
    PersonBankAccountComponent,
    BankDialog,
    ImportFromExcelDialog,
    BankComponent,
    BankLookup,
    BankAccountDialog,
    BankAccountComponent,
    DailyOperationDialog,
    DailyOperationComponent,
    BranchComponent,
    BranchDialog,
    BranchLookup,
    ReportViewerComponent,
    FixSentenceDialog,
    FixSentenceComponent,
    FixSentenceLookupComponent,

    CarGroupDialog,
    CarGroupComponent,
    CarGroupLookup,

    PackagingDialog,
    PackagingComponent,

    TrailerBuilderComponent,
    TrailerBuilderDialog,
    TrailerBuilderLookupComponent,

    TrailerComponent,
    TrailerDialog,
    TrailerLookup,

    TonnageTypeLookupComponent,
    TrailerOWnerTypeLookup,
    CarManufacturerGroupLookup,
    TrailerOwnerTypeComponent,
    TrailerOwnerTypeDialog,
    LoadingLocationDialog,
    LoadingLocationComponent,
    LoadingLocationLookupComponent,
    GeteLoadingLocationDialog,
    GeteLoadingLocationComponent,
    GeteManufacturerDialog,
    GeteManufacturerComponent,
    GeteManufacturerZoneDialog,
    GeteManufacturerZoneComponent,
    GeteZoneDialog,
    GeteZoneComponent,
    AmaniComponent,
    InvoiceSubsidyComponent,
    InvoiceReplaceComponent,
    InvoiceHavaleComponent,
    InvoiceAccessoryComponent,
    InvoicePenaltyComponent,
    InvoiceAmaniComponent,
    InvoiceRecarComponent,
    AmaniDialog,
    EntranceFromDialog,
    EntranceFromLookup,
    EntranceFromComponent,
    TonnageTypeDialog,
    TonnageTypeComponent,

    CarTypeComponent,
    CarTypeDialog,
    CarTypeLookupComponent,

    GoodsComponent,
    GoodsDialog,
    ConsumerItemComponent,
    ConsumerItemDialog,
    AgendaComponent,
    AgendaDialog,
    AgendaCarToAgendaDialog,
    AgendaSetReceipt,
    AgendaMoved2AccDialog,
    AgendaSetReceiptGroup,
    AgendaMove2AccGroupDialog,
    SetReceiptFoeEternalAgenda,
    ChangeAgendaBranch,
    InlineAddCarToAgenda,
    InvoiceAgendaComponent,
    AgentComponent,
    AgentDialog,
    AgentLookup,
    FareComponent,
    FareDialog,
    GeteFareComponent,
    GeteFareDialog,
    DeliveryWaybillComponent,
    DeliveryWaybillDialog,

    CarComponent,
    CarDialog,
    CarLookupDialog,

    RecurrentCarComponent,
    ExitCarDialog,

    ProvinceComponent,
    ProvinceDialog,
    ProvinceLookup,

    CityComponent,
    CityDialog,
    CityLookupComponent,

    GisComponent,
    ShippingCompanyComponent,

    DriverComponent,
    DriverDialog,
    DriverLookup,

    SubsidyComponent,
    SubsidyDialog,
    DriverAttendComponent,
    DriverAttendDialog,
    PenaltyComponent,
    PenaltyDialog,
    CarManufacturerGroupDialog,
    CarManufacturerGroupComponent,
    CarManufacturerDialog,
    CarManufacturerComponent,
    CarManufacturerLookup,
    // ErrorDialog
  ],

  declarations: [
    TrailerFareComponent,
    TrailerFareDialog,    
    CargoComponent,
    CargoDialog,
    UploadComponent,
    InvalidAgendaComponent,
    InvalidAgendaDialog,
    ActivityComponent,
    ReplaceTrailerComponent,
    ReplaceTrailerDialog,
    BillComponent,
    BillDialog,
    BillTypeDialog,
    BillTypeComponent,
    IssicoNameComponent,
    IssicoNameDialog,
    WarrantyComponent,
    WarrantyDialog,
    TankhahComponent,
    TankhahDialog,
    MessageComponent,
    MessageDialog,
    PostComponent,
    PostDialog,
    WarrantyDialog,
    PostComponent,
    PostDialog,
    InvoiceFactorComponent,
    InvoiceSofteComponent,
    DriverFactorComponent,
    DriverFactorDialog,
    TruckLoanComponent,
    TruckLoanDialog,
    SofteComponent,
    SofteDialog,
    DriverAccessoryComponent,
    DriverAccessoryDialog,
    AccessoryComponent,
    AccessoryDialog,
    CashDepositComponent,
    CashDepositDialog,
    TargetBranchComponent,
    HavaleComponent,
    HavaleDialog,
    TrailerActivityComponent,
    TrailerBranchComponent,
    InvoiceChaqueComponent,
    KafDialog,
    KafComponent,
    KafRentPaidDialog,
    KafRentPaidComponent,
    TrailerCertDialog,
    TrailerCertComponent,
    TrailerCertItemDialog,
    TrailerCertItemComponent,
    DriverPenaltyItemDialog,
    DriverPenaltyItemComponent,
    FactoryFareDialog,
    FactoryFareComponent,
    ChaqueDialog,
    ChaqueComponent,
    OutTransTimeComponent,
    OutTransTimeDialog,
    PaidCashInvoiceComponent,
    InvoiceSearchDialogComponent,
    AutoPartsDialog,
    PaidCashInvoiceDialog,
    RecurrentCarComponent,
    RecurrentCarDialog,
    PayTypeDialog,
    PayTypeComponent,
    AgendaPayTypeDialog,
    AgendaPayTypeComponent,
    ContactDialog,
    AddUserToPersonDialog,
    PersonComponent,
    PersonLookup,
    PersonBankAccountComponent,
    BankDialog,
    ImportFromExcelDialog,
    BankComponent,
    BankLookup,
    BankAccountDialog,
    BankAccountComponent,
    DailyOperationDialog,
    DailyOperationComponent,
    BranchComponent,
    BranchDialog,
    BranchLookup,
    ReportViewerComponent,

    FixSentenceComponent,
    FixSentenceDialog,
    FixSentenceLookupComponent,

    LoadingLocationComponent,
    LoadingLocationDialog,
    LoadingLocationLookupComponent,
    GeteLoadingLocationComponent,
    GeteLoadingLocationDialog,
    GeteManufacturerComponent,
    GeteManufacturerDialog,
    GeteManufacturerZoneComponent,
    GeteManufacturerZoneDialog,
    GeteZoneComponent,
    GeteZoneDialog,
    AmaniComponent,
    InvoiceSubsidyComponent,
    InvoiceReplaceComponent,
    InvoiceHavaleComponent,
    InvoiceAccessoryComponent,
    InvoicePenaltyComponent,
    InvoiceAmaniComponent,
    InvoiceRecarComponent,
    InvoiceKafComponent,
    AmaniDialog,
    EntranceFromDialog,
    EntranceFromLookup,
    EntranceFromComponent,

    TrailerBuilderComponent,
    TrailerBuilderDialog,
    TrailerBuilderLookupComponent,

    TrailerComponent,
    TrailerDialog,
    TrailerLookup,

    TonnageTypeLookupComponent,
    TrailerOWnerTypeLookup,
    CarManufacturerGroupLookup,
    CarManufacturerLookup,
    TrailerOwnerTypeComponent,
    TrailerOwnerTypeDialog,

    CarTypeComponent,
    CarTypeDialog,
    CarTypeLookupComponent,

    GoodsComponent,
    GoodsDialog,

    ConsumerItemComponent,
    ConsumerItemDialog,
    AgendaComponent,
    AgendaComponent,
    AgendaDialog,
    AgendaCarToAgendaDialog,
    AgendaSetReceipt,
    AgendaMoved2AccDialog,
    AgendaSetReceiptGroup,
    AgendaMove2AccGroupDialog,
    SetReceiptFoeEternalAgenda,
    ChangeAgendaBranch,
    InlineAddCarToAgenda,
    InvoiceAgendaComponent,

    AgentComponent,
    AgentDialog,
    AgentLookup,
    FareComponent,
    FareDialog,
    GeteFareComponent,
    GeteFareDialog,

    CarComponent,
    CarDialog,
    CarLookupDialog,

    RecurrentCarComponent,
    ExitCarDialog,

    ProvinceComponent,
    ProvinceDialog,
    ProvinceLookup,

    CityComponent,
    CityDialog,
    CityLookupComponent,

    DeliveryWaybillComponent,
    DeliveryWaybillDialog,
    ShippingCompanyComponent,

    DriverComponent,
    DriverDialog,
    DriverLookup,

    SubsidyComponent,
    SubsidyDialog,
    DriverAttendComponent,
    DriverAttendDialog,
    PenaltyComponent,
    PenaltyDialog,
    TonnageTypeComponent,
    TonnageTypeDialog,
    CarManufacturerGroupComponent,
    CarManufacturerGroupDialog,
    CarManufacturerDialog,
    CarManufacturerComponent,
    FormComponent,
    GisComponent,

    CarGroupComponent,
    CarGroupDialog,
    CarGroupLookup,

    PackagingComponent,
    PackagingDialog,
    // ErrorDialog,
    NumberToPersianPipe,
    JalaliPipe,
    ChakavakCurrency
  ]
})
export class FormModule {
  constructor(private translate: TranslateService) {
    translate.setDefaultLang('fa');
    translate.use('fa');
  }
}
