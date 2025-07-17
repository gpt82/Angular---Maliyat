import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { State, FilterDescriptor, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AgendaDialog } from './agenda.dialog';
import * as moment from 'jalali-moment';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AgendaCarToAgendaDialog } from './add-car-to-agenda';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { AgendaSetReceipt } from './agenda-set-receipt.dialog';
import { ReportService } from '../../shared/services/report-service';
import { AgendaBankReportType, AgendaState } from './dtos/AgendaState';
import { SetReceiptFoeEternalAgenda } from './set-receipt-for-external-agenda.dialog';
import { AgendaDetailDto } from './dtos/AgendaDetailDto';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { AuthService } from '../../core/services/app-auth-n.service';
import { AutoPartsDialog } from '../auto-parts/auto-parts.dialog';
import { AutoParts } from '../auto-parts/dtos/auto-partsDto';
import { Subject } from 'rxjs';
import { PaidCashInvoiceDialog } from '../invoice/paid-cash-invoice.dialog';
import { InvoiceService } from '../invoice/invoice.service';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { AgendaService } from './agenda.service';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { OutTransTimeDialog } from './out-trans-time.dialog';
import { IntlService } from '@progress/kendo-angular-intl';
import { AgendaSetReceiptGroup } from './agenda-set-receipt-group.dialog';
import { map } from 'rxjs/operators';
import { AgendaMoved2AccDialog } from './agenda-move-acc.dialog';
import { AgendaMove2AccGroupDialog } from './agenda-move2acc-group.dialog';
import { ImportFromExcelDialog } from './import-from-excel.dialog';
import { ChangeAgendaBranch } from './change-agenda-branch.dialog';
import { SelectionEvent } from '@progress/kendo-angular-grid';
import { AgendaChangeFare } from './agenda-change-fare.dialog';
const Normalize = data =>
    data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'agenda-component',
    templateUrl: './agenda.component.html',
    styles: [
        `
      .k-grid tr.even {
        background-color: #f45c42;
      }
      .k-grid tr.odd {
        background-color: #41f4df;
      }
    `
    ],
    providers: [HttpClient]
})
export class AgendaComponent extends GridBaseClass implements OnInit, OnDestroy {
    destroy$: Subject<boolean> = new Subject<boolean>();
    @ViewChild(TooltipDirective)
    public tooltipDir: TooltipDirective;
    isEdit = false;
    chechDiffrenceCarCount = false;
    canEditPreFarepaid = true;
    enableCashPayConfirm = true;
    canEditPayGete = true;
    canEditCashBillPaid = true;
    canEditDSC = true;
    branchIds: number[];
    showFilter = 'false';
    userBranchFareContract = "";
    // public mySelection: number[] = [];
    drivers: any[] = [];
    public branches: any[];
    public payTypes: any[];
    public trailerOwnerTypes: any[];
    public tonnageTypes = [];
    menuItems: any[];
    menu1: any[] = [
        {
            text: 'فایل',
            code: 'file',
            items: [
                { text: 'ابطال', code: 'cancel' },
                // ...(this.authService.isSuperAdmin ? [{ text: 'تغییر شعبه', code: 'changeBranch' }] : []),
                ...(this.authService.isSuperAdmin || ['بهمن نیا', 'ذوالنوری'].some(substring => this.authService.getFullName().includes(substring)) ? [{ text: 'تغییر شعبه', code: 'changeBranch' }] : []),
                { text: 'صورتحساب', code: 'Invoice' },
                { text: 'تغییر کرایه', code: 'ChangeFare' },
                { text: 'تسویه حساب تریلر', code: 'CheckoutTrailer' },
                ...(['عظیمی', 'صادقی', 'فیروزه', 'ندرتی', 'میثم', 'رسولی', 'ذوالنوری'].some(substring => this.authService.getFullName().includes(substring)) ?
                    [{ text: 'ورود گروهی از اکسل', code: 'ImportFromExcel' }, { text: 'رسید گروهی ', code: 'GroupPaid' }, { text: 'تاییدگروهی پرداخت پیشکرایه ', code: 'GroupPrefarePaid' }
                        , { text: 'انتقال گروهی به حسابداری', code: 'GroupMove2Acc' }//] : []),
                    ] : []),
            ]//this.authService.getFullName().includes(['میثم', 'ندرتی', 'رسولی', 'نادری', 'فرشادی'])
        },
        {
            text: 'ایجاد',
            code: 'new'
        },
        { text: 'ثبت رسید', code: 'recept' },
        {
            text: 'صورت جلسه حمل ',
            code: 'ListAgendaCars'
        }];
    menu3: any[] = [
        {
            text: 'گزارش مالی',
            code: 'Mali1Report',
            items: [
                { text: 'گزارش پیشکرایه', code: 'Mali1Report1' },
                { text: 'گزارش کارکرد', code: 'Mali1Report2' },
                { text: 'گزارش انعام', code: 'Mali1Report3' },
                { text: 'گزارش میلک', code: 'Mali1Report4' },
                { text: 'گزارش تفصیلی صورتحساب', code: 'AgendaListTafsiliReport' }
            ]
        },
    ];
    menu4: any[] = [
        {
            text: 'گزارش حسابرسی',
            code: 'AuditReport',
            items: [
                { text: 'گزارش قرارداد ', code: 'AgendaFareContractReport' },
                { text: 'گزارش شعبه ', code: 'BranchFareContractReport' },
                { text: 'گزارش فرستنده/گیرنده ', code: 'AgendaSenderReport' },
                { text: 'تعداد تسویه شده/نشده', code: 'BranchwiseInvoiceReport' },
                { text: 'تعداد میلک بارنامه ها', code: 'AgendaListMilkReport' },
                { text: ' بارنامه های تسویه شده/نشده', code: 'AgendaListTasvieReport' },
                { text: 'گزارش  میلک', code: 'MilkRunReport' },
                { text: 'گزارش اختلاف میلک', code: 'DiffrenceMilkRunReport' },
                { text: 'اختلاف تعدادبار', code: 'DiffrenceCarCount' },
                { text: 'کرایه بالاتر از محدوده', code: 'AgendaMaxFareReport' },
                { text: 'گزارش بانک  پیشکرایه', code: 'AgendaBankPreFareReport' },
                { text: 'گزارش بانک  انعام', code: 'AgendaBankRewardReport' },
                { text: 'گزارش بانک  با,قیمانده', code: 'AgendaBankRemainingFareReport' },
                { text: 'گزارش واریزی بانک  ', code: 'AgendaVarizyBankReport' }
            ]
        },
    ];
    menu2: any[] = [
        {
            text: 'گزارشات',
            code: 'reports',
            items: [
                { text: 'گزارش نمایندگی', code: 'AgentAgendasReport' },
                { text: 'گزارش به تفکیک بارگیر', code: 'AgendaGroupByTonnageTypeReport' },
                { text: 'گزارش راننده', code: 'DriverAgendasReport' },
                { text: 'گزارش تریلر', code: 'TrailerAgendasReport' },
                { text: 'صورتحساب مالی رانندگان', code: 'AgendaListReport' },
                { text: 'صورتحساب عملیات رانندگان', code: 'AgendaListDrvrReport' },
                { text: ' تاریخ پرداخت پیشکرایه', code: 'AgendaListPreFarePayDateReport' },
                { text: 'گزارش بارنامه های حمل قطعه', code: 'AgendaGeteListReport' },
                { text: 'گزارش بارنامه های حمل بدنه', code: 'AgendaBadaneListReport' },
                { text: 'گزارش بارنامه های دارای SUV ', code: 'AgendaSUVReport' },
                { text: 'به تفکیک استان', code: 'AgendaPerProvinceReport' },
                { text: ' بارگیری رانندگان', code: 'DriverBargiriReport' },
                { text: 'تعداد سرویس رانندگان', code: 'AgendaPerDriverReport' },
                { text: 'گزارش بارنامه رانندگان', code: 'AgendaGroupByDriverReport' },
                { text: 'گزارش بارنامه تریلر', code: 'AgendaGroupByTrailerReport' },
                { text: 'گزارش کفهای اجاره ای ', code: 'AgendaKafRentReport' },
                { text: 'گزارش کفهای بدون بارگیری ', code: 'KafWithoutServiceReport' },
                // ...(this.authService.isSuperAdmin || this.authService.isAccAdmin ? [{ text: 'گزارش قرارداد ', code: 'AgendaFareContractReport' }] : []),
                // ...(this.authService.isSuperAdmin || this.authService.isAccAdmin ? [{ text: 'گزارش شعبه ', code: 'BranchFareContractReport' }] : []),
                // { text: 'گزارش  میلک ران', code: 'MilkRunReport' },
                { text: 'گزارش ایسیکو', code: 'EsicoReprot' },
                { text: 'گزارش ایران خودرو', code: 'IranKhodroReport' },
                {
                    text: 'صورتحساب ایران خودرو',
                    code: 'AggAgendaReport',
                    items: [
                        { text: 'استان', code: 'AggProvinceOnly' },
                        { text: 'استان و شهرستان', code: 'AggProvinceCity' },
                        { text: 'بدنه', code: 'AggAgendaBadaneReport' }
                        // { text: '  شهرستان', code: 'AggProvinceCity' }
                    ]
                }
            ]
        }
    ];
    constructor(
        public intl: IntlService,
        public dialog: MatDialog,
        private router: Router,
        public snackBar: MatSnackBar,
        private http: HttpClient,
        public authService: AuthService,
        public agendaService: AgendaService,
        private invoiceService: InvoiceService,
        public sb: MatSnackBar
    ) {
        super(http, '/v1/api/Agenda/', dialog);
        this.gridName = 'agendaGrid';
        // this.dispatch();

        authService.getUserBranches().subscribe(result => (this.branchIds = result.map(a => +a.id)));
        this.authService.getUserBranches()
            .pipe(
                map(br => (br.filter(br => br.id == this.authService.selectedBranchId))))
            .subscribe(result => {
                this.userBranchFareContract = result[0]['fareContract'];
                console.log(result)


                // authService.getUserBranchName().subscribe(result => (this.User[] = result));
                //   this.authService.getUserBranchName().subscribe(res=> this.UserBranchName =res);
            });


        this.resetSelectedRowIds();
        this.setModalCordinate(1000, 500);
        const gridSettings: State = this.getState();
        // const gridSettings: State = this.state;
        if (gridSettings !== null) {
            this.state = gridSettings;
        }
        this.fillGrid();
        // this.isBusy = service.isBusy;
    }
    canEditDSc() {
        this.canEditDSC = ['ذوالنوری', 'میثم', 'فهیمی'].some(substring => this.authService.getFullName().includes(substring));
    }
    // لیست بارنامه هایی که یکماه از تاریخ صدور گذشته ولی تسویه نشده اند
    // listAgendaNotPaid() {
    //   this.SearchText = 'lastMonth';
    //   this.applyGridFilters(this.getUrl() + 'lastMonth');
    //   this.view = this.service;
    // }
    // dispatch() {
    //   // const config = new MatSnackBarConfig();
    //   const config: MatSnackBarConfig = {
    //     panelClass: 'style-success',
    //     duration: 10000,
    //     horizontalPosition: 'right',
    //     verticalPosition: 'bottom'
    //   };
    //   const snackBarRef = this.sb.open('تعدادی از بارنامه ها با تاریخ صدور بیش از یک ماه هنوز تسویه نشده اند', 'نمایش لیست', config);
    //   snackBarRef.afterDismissed().subscribe((info: any) => {
    //     if (info.dismissedByAction === true) {
    //       this.listAgendaNotPaid();
    //     }
    //   });
    // }

    // @HostListener('window:resize', ['$event'])
    // onResize(event) {
    //   this.innerWidth = window.innerWidth;
    // }
    // vis(): boolean {
    //   this.isMobileDevice =  +window.innerWidth < 992;
    //   return +window.innerWidth < 992;
    // }
    public showTooltip(e: MouseEvent): void {
        const element = e.target as HTMLElement;
        if (
            (element.nodeName === 'TD' || element.nodeName === 'TH') &&
            element.offsetWidth < element.scrollWidth
        ) {
            this.tooltipDir.toggle(element);
        } else {
            this.tooltipDir.hide();
        }
    }
    fillGrid() {
        super.applyGridFilters();
        this.view = this.service;
    }
    ngOnInit() {
        this.getLookups();
        this.getTonnageTypes();
        this.menuItems = this.authService.isAccUser ? this.menu2 : this.menu1.concat(this.menu2);
        this.menuItems = this.canShowMenu3() ? this.menuItems.concat(this.menu3) : this.menuItems;
        this.menuItems = this.canShowMenu4() ? this.menuItems.concat(this.menu4) : this.menuItems;
        this.canEdit();
    }
    getTonnageTypes(): void {
        this.http
            .get('/v1/api/Lookup/tonnageTypes')
            .subscribe((result: ILookupResultDto[]) => (this.tonnageTypes = result));
    }
    getLookups(): void {
        this.http
            .get('/v1/api/Lookup/branchs')
            .subscribe((result: ILookupResultDto[]) => (this.branches = result));
        this.http
            .get('/v1/api/Lookup/agendaPayTypes')
            .subscribe((result: ILookupResultDto[]) => (this.payTypes = result));
        this.http
            .get('/v1/api/Lookup/ownerTypes')
            .subscribe((result: ILookupResultDto[]) => (this.trailerOwnerTypes = result));
        //   this.http.get("/v1/api/Lookup/drivers").subscribe(result => this.drivers = Normalize(result));
        //   this.http.get("/v1/api/Lookup/trailers").subscribe(result => this.trailers = Normalize(result));
    }
    canShowMenu3(): boolean {
        return this.authService.isSuperAdmin || ['گلستانی', 'عظیمی', 'صادقی', 'فیروزه'].some(substring => this.authService.getFullName().includes(substring));
    }
    canShowMenu4(): boolean {
        return ['عظیمی', 'صادقی', 'رسولی', 'ذوالنوری', 'میثم', 'ندرتی', 'فرشادی', 'نصیری', 'خلیل پور', 'گلستانی'].some(substring => this.authService.getFullName().includes(substring));
    }
    isAcclvl3(): boolean {
        return ['فیروزه', 'عظیمی', 'صادقی', 'ذوالنوری', 'میثم', 'ندرتی'].some(substring => this.authService.getFullName().includes(substring));
    }
    canEdit() {
        this.canEditPreFarepaid = ['میثم', 'ذوالنوری', 'ندرتی', 'رسولی', 'عظیمی', 'صادقی', 'فرشادی'].some(substring => this.authService.getFullName().includes(substring));
        this.enableCashPayConfirm = ['میثم', 'ذوالنوری', 'ندرتی', 'رسولی', 'عظیمی', 'صادقی', 'نصیری', 'فرشادی'].some(substring => this.authService.getFullName().includes(substring));
        this.canEditPayGete = this.authService.isSuperAdmin || ['فیروزه', 'ندرتی', 'رجبی', 'عظیمی', 'صادقی', 'فرشادی'].some(substring => this.authService.getFullName().includes(substring));
        this.canEditCashBillPaid = this.authService.isSuperAdmin || ['فیروزه', 'صادقی'].some(substring => this.authService.getFullName().includes(substring));
    }
    getRowClass({ dataItem, index }) {
        const dt = +new Date(dataItem.entity.exportDate);
        const dtnow = +new Date();
        const diff = dtnow - dt;
        const diffDays = Math.floor(diff / 86400000); // days
        // const diffMins = Math.round(((diff % 86400000) % 3600000) / 60000); // minutes
        const diffHrs = Math.floor(diff / 3600000); // hours


        const estOpZero = dataItem.entity.transTime !== 0;
        const estBigerHrs = diffHrs > dataItem.entity.transTime;
        // if(diffHrs> dataItem.transTime)
        const isEven =
            !dataItem.entity.isDelivered &&
            estOpZero &&
            estBigerHrs;
        return {
            even: isEven,
            odd: !isEven
        };
        // if (dataItem == null) {
        //   return '';
        // }
        // return {
        //   canceled: dataItem.entity.state === 2,
        //   '': dataItem.entity.state !== 2
        // };
    }

    onCreate(): void {
        this.http.get('/v1/api/Agenda/lastWaybillNumber/' + this.authService.selectedBranchId).subscribe(result => {
            const agenda = new AgendaDetailDto(null);
            agenda.waybillNumber = result['number'];
            agenda.waybillSeries = result['series'];
            const currentDate = moment();
            const dialogRef = this.dialog.open(AgendaDialog, {
                width: this.modalCordinate.width,
                height: this.modalCordinate.height,
                disableClose: true,
                data: {
                    datePickerConfig: {
                        drops: 'down',
                        format: 'YY/M/D  ساعت  HH:mm',
                        showGoToCurrent: 'true'
                    },
                    Agenda: agenda,
                    dialogTitle: 'ایجاد',
                    isEdit: false,
                    isGete: this.authService.selectedBranchNmae.includes('قطعه'),
                    exportDate: currentDate.locale('fa'),
                    fareContract: this.userBranchFareContract,
                }
            });
            dialogRef.afterClosed().subscribe(result1 => {
                if (result1 && result1.state === 'successful') {
                    this.fillGrid();
                    this.resetSelectedRowIds();
                    if (result1.showAddCarToAgendaForm) {
                        const obj = Object.create({
                            waybillNumber: result1.waybillNumber,
                            waybillSeries: result1.waybillSeries,
                            id: result1.id
                        });
                        // this.onListAgendaCars(obj);
                        this.onList(obj);
                    }
                }
            });
        });
    }

    onEdit(id: number): void {
        // let headers1 = new HttpHeaders({ "Content-Type": "application/json" });
        // this.http
        this.getEntity(id).subscribe(result => {
            const agenda = new AgendaDetailDto(result['entity']);
            const dialogRef = this.dialog.open(AgendaDialog, {
                width: this.modalCordinate.width,
                height: this.modalCordinate.height,
                disableClose: true,
                data: {
                    datePickerConfig: {
                        drops: 'down',
                        format: 'YY/M/D  ساعت  HH:mm',
                        showGoToCurrent: 'true'
                    },
                    Agenda: agenda,
                    exportDate: moment(agenda.exportDate).locale('fa'),
                    dialogTitle: 'ویرایش ',
                    isEdit: true,
                    allow48: result['entity'].allow48,
                    isPreFarePaid: !(this.isAcclvl3() || !result['entity'].isPreFarePaid),
                    readOnlyAcclvl2: !(this.isAcclvl3() || !result['entity'].isPaidlvl2),
                    isMoved2Acc: !(this.isAcclvl3() || !result['entity'].isMoved2Acc),
                    readOnly: this.authService.isReadOnlyUser || result['entity'].invoiceId > 0
                }
            });
            dialogRef.afterClosed().subscribe(result1 => {
                if (result1 && result1.state === 'successful') {
                    if (result1.showAddCarToAgendaForm) {
                        const obj = Object.create({
                            waybillNumber: result1.waybillNumber,
                            waybillSeries: result1.waybillSeries,
                            id: result1.id
                        });
                        this.onList(obj);
                    } else {
                        this.fillGrid();
                        this.resetSelectedRowIds();
                    }
                }
            });
        });
    }
    onOutTransTime(agendaId: number): void {
        const dialogRef = this.dialog.open(OutTransTimeDialog, {
            width: '500px',
            height: '250px',
            disableClose: true,
            data: {
                agendaId: agendaId,
                Sentence: {
                    description: '',
                    id: 0
                },
                dialogTitle: 'ایجاد',
                isEdit: false
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.state === 'successful') {
                this.setAgendaDelivered();
                const headers1 = new HttpHeaders({
                    'Content-Type': 'application/json'
                });
                this.http
                    .post(
                        this.getUrl() + 'outTrans',
                        JSON.stringify({
                            AgendaId: this.selectedRowIds[0].entity.id,
                            DiffTime: this.getDiffTime(),
                            Description: result.description,
                        }),
                        { headers: headers1 }
                    )
                    .subscribe(() => {
                        this.fillGrid();
                        this.resetSelectedRowIds();
                    });
            }
        });
    }
    isOutTransTime() {
        const diffHrs = this.getDiffTime(); // hours

        const estOpZero = this.selectedRowIds[0].entity.transTime !== 0;
        const estBigerHrs = diffHrs > this.selectedRowIds[0].entity.transTime;
        // if(diffHrs> dataItem.transTime)
        const inOutTransDelivered =
            // !this.selectedRowIds[0].entity.isDelivered &&
            estOpZero &&
            estBigerHrs;
        return inOutTransDelivered ? true : false;
    }
    getDiffTime() {
        const dt = +new Date(this.selectedRowIds[0].entity.exportDate);
        const dtnow = +new Date();
        const diff = dtnow - dt;
        // const diffDays = Math.floor(diff / 86400000); // days
        // const diffMins = Math.round(((diff % 86400000) % 3600000) / 60000); // minutes
        return Math.floor(diff / 3600000); // hours
    }
    onList(data): void {
        if (this.authService.isAutoParts) {
            this.onListAgendaAutoParts(data);
        } else {
            this.onListAgendaCars(data);
        }
    }
    onListAgendaCars(data): void {
        const title = 'افزودن سواری به بارنامه با شماره =' + data.waybillNumber;
        const dialogRef = this.dialog.open(AgendaCarToAgendaDialog, {
            width: '1200px',
            height: '550px',
            disableClose: true,
            data: {
                agendaId: data.id,
                dialogTitle: title,
                isEdit: true
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result.showReport) {
                // this.selectedRowIds = [];
                this.agendaService.onAgendaCarsReport(data.id);
            } else {
                this.fillGrid();
                this.resetSelectedRowIds();
            }
        });
    }
    onListAgendaCashPay(): void {
        const title = 'ایجادصورتحساب مالی';
        const ids = this.selectedRowIds.map(a => a['entity'].id).join();
        const currentDate = moment();
        const dialogRef = this.dialog.open(PaidCashInvoiceDialog, {
            width: '1000px',
            height: '550px',
            disableClose: true,
            data: {
                invoiceNumber: '',
                invoiceDate: currentDate.locale('fa'),
                agendaIds: ids,
                dialogTitle: title,
                isEdit: false
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            // if (result.showReport) {
            //   // this.selectedRowIds = [];
            //   this.onAgendaCarsReport(data.id);
            // } else {
            //   this.fillGrid();
            // }
        });

    }
    onListAgendaAutoParts(data): void {
        const title = 'افزودن لیست قطعات به بارنامه با شماره =' + data.waybillNumber;
        let autoParts: AutoParts[] = [];
        this.http.get(`/v1/api/Agenda/${data.id}/AutoParts`).subscribe(res => {
            autoParts = <AutoParts[]>res;
            const dialogRef = this.dialog.open(AutoPartsDialog, {
                width: '1000px',
                height: '550px',
                disableClose: true,
                data: {
                    agendaId: data.id,
                    autoParts: autoParts,
                    dialogTitle: title,
                    isEdit: true
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                // if (result.showReport) {
                //   // this.selectedRowIds = [];
                //   this.onAgendaCarsReport(data.id);
                // } else {
                //   this.fillGrid();
                // }
            });
        });

    }
    SetReceiptForExternalAgenda(): void {
        const currentDate = moment();
        const dialogRef = this.dialog.open(SetReceiptFoeEternalAgenda, {
            width: '550px',
            height: '590px',
            disableClose: true,
            data: {
                datePickerConfig: {
                    drops: 'down',
                    format: 'YY/M/D',
                    showGoToCurrent: 'true'
                },
                canSetReceiptFunction: this.canSetReceipt,
                receivedDate: currentDate.locale('fa'),
                dialogTitle: 'جستجوی بارنامه '
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.state === 'successful') {
                this.fillGrid();
                this.resetSelectedRowIds();
            }
        });
    }
    ChangeAgendaBranch(): void {
        const currentDate = moment();
        const dialogRef = this.dialog.open(ChangeAgendaBranch, {
            width: '550px',
            height: '590px',
            disableClose: true,
            data: {
                datePickerConfig: {
                    drops: 'down',
                    format: 'YY/M/D',
                    showGoToCurrent: 'true'
                },
                canSetReceiptFunction: this.canSetReceipt,
                receivedDate: currentDate.locale('fa'),
                dialogTitle: 'جستجوی بارنامه '
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.state === 'successful') {
                this.fillGrid();
                this.resetSelectedRowIds();
            }
        });
    }
    onInvoicePrintPreview() {
        const invoiceId = this.selectedRowIds[0].entity.invoiceId;
        if (invoiceId > 0) {
            this.invoiceService.printPreviewInvoice(invoiceId);
        } else {
            alert('بارنامه تسویه نشده است.');
        }
    }

    onSetReceipt(data): void {
        const agenda = data; // this.selectedRowIds[0].entity;

        const currentDate = moment();
        const dialogRef = this.dialog.open(AgendaSetReceipt, {
            width: '300px',
            height: '410px',
            disableClose: true,
            data: {
                datePickerConfig: {
                    drops: 'down',
                    format: 'YY/M/D',
                    showGoToCurrent: 'true'
                },
                id: agenda.id,
                isNotReceived: agenda.persianReceivedDate === '',
                paidlvl2Date: moment(agenda.paidlvl2Date).locale('fa'),
                paidlvl2Number: agenda.paidlvl2Number,
                dialogTitle: ' پرداخت بارنامه  '
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.state === 'successful') {
                const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
                this.http
                    .put(
                        this.getUrl() + 'Paidlvl2/' + agenda.id,
                        JSON.stringify({
                            paidlvl2Date: moment(result.paidlvl2Date).locale('fa'),
                            paidlvl2Number: result.paidlvl2Number,
                            isPaid: result.isPaid
                        }),
                        { headers: headers1 }
                    ).subscribe(() => {
                        this.fillGrid();
                        this.resetSelectedRowIds();
                    });
            }
        });
    }
    onAgendaMoved2Acc(data): void {
        const agenda = data; // this.selectedRowIds[0].entity;

        const currentDate = moment();
        const dialogRef = this.dialog.open(AgendaMoved2AccDialog, {
            width: '300px',
            height: '410px',
            disableClose: true,
            data: {
                datePickerConfig: {
                    drops: 'down',
                    format: 'YY/M/D',
                    showGoToCurrent: 'true'
                },
                id: agenda.id,
                isNotReceived: agenda.persianReceivedDate === '',
                moved2AccDate: moment(agenda.moved2AccDate).locale('fa'),
                // paidlvl2Number: agenda.paidlvl2Number,
                dialogTitle: ' انتقال  بارنامه به حسابداری  '
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.state === 'successful') {
                const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
                this.http
                    .put(
                        this.getUrl() + 'Moved2Acc/' + agenda.id,
                        JSON.stringify({
                            moved2AccDate: moment(result.moved2AccDate).locale('fa'),
                            // paidlvl2Number: result.paidlvl2Number,
                            isPaid: result.isPaid
                        }),
                        { headers: headers1 }
                    ).subscribe(() => {
                        this.fillGrid();
                        this.resetSelectedRowIds();
                    });
            }
        });
    }
    onSetGroupPrefarePaid(): void {

        const currentDate = moment();
        const dialogRef = this.dialog.open(AgendaMoved2AccDialog, {
            width: '300px',
            height: '410px',
            disableClose: true,
            data: {
                datePickerConfig: {
                    drops: 'down',
                    format: 'YY/M/D',
                    showGoToCurrent: 'true'
                },

                dialogTitle: 'تایید گروهی پرداخت پیشکرایه'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.state === 'successful') {
                const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
                this.http
                    .put(
                        this.getUrl() + 'GroupPrefarePaid/',
                        JSON.stringify({
                            FromDate: moment(result.moved2AccDate).locale('fa'),
                            ToDate: moment(result.moved2AccDate).locale('fa'),
                            // paidlvl2Number: result.paidlvl2Number,
                            isPaid: result.isPaid
                        }),
                        { headers: headers1 }
                    ).subscribe(() => {
                        this.fillGrid();
                        this.resetSelectedRowIds();
                    });
            }
        });
    }
    //////////////
    onImportFromExcel(): void {
        const dialogRef = this.dialog.open(ImportFromExcelDialog, {
            width: '700px',
            height: '550px',
            disableClose: true,
            data: {
                datePickerConfig: {
                    drops: 'down',
                    format: 'YY/M/D',
                    showGoToCurrent: 'true'
                },
                // id: id,
                // receivedDate: currentDate.locale('fa'),
                dialogTitle: 'ورودی اکسل بارنامه'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (!this.authService.isReadOnlyUser)
                if (result && result.state === 'successful') {
                    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
                    // this.http
                    //   .put(this.getUrl() + 'CashPayment/' + id,
                    //     JSON.stringify({
                    //       PayDate: result.date
                    //     }),
                    //     { headers: headers1 }
                    //   ).subscribe((res) => {
                    //     this.fillGrid();
                    //     this.resetSelectedRowIds();
                    //   });
                }
        });
    }
    /////////////////
    onSetReceiptGroup(): void {
        // const agenda = data; // this.selectedRowIds[0].entity;

        const currentDate = moment();
        const dialogRef = this.dialog.open(AgendaSetReceiptGroup, {
            width: '300px',
            height: '430px',
            disableClose: true,
            data: {
                datePickerConfig: {
                    drops: 'down',
                    format: 'YY/M/D',
                    showGoToCurrent: 'true'
                },
                id: "",
                isNotReceived: "",
                payDate: "",
                piadNumber: "",
                dialogTitle: 'ثبت گروهی شماره صورتحساب'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.state === 'successful') {
                const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
                this.http
                    .put(
                        this.getUrl() + 'GroupPaid/',
                        JSON.stringify({
                            payDate: moment(result.payDate).locale('fa'),
                            fromDate: moment(result.fromDate).locale('fa'),
                            toDate: moment(result.toDate).locale('fa'),
                            branchId: result.branchId,
                            payNumber: result.piadNumber,
                            isPaid: result.isPaid
                        }),
                        { headers: headers1 }
                    ).subscribe(() => {
                        this.fillGrid();
                        this.resetSelectedRowIds();
                    });
            }
        });
    }
    /////////
  onChangeFare(): void {
        // const agenda = data; // this.selectedRowIds[0].entity;

        const currentDate = moment();
        const dialogRef = this.dialog.open(AgendaChangeFare, {
            width: '480px',
            height: '400px',
            disableClose: true,
            data: {
                datePickerConfig: {
                    drops: 'down',
                    format: 'YY/M/D',
                    showGoToCurrent: 'true'
                },
                dialogTitle: 'تغییر کرایه ها'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.state === 'successful') {
                const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
                this.http
                    .post(
                        this.getUrl() + 'ChangeFare/',
                        JSON.stringify({
                            fromDate: moment(result.fromDate).locale('fa'),
                            toDate: moment(result.toDate).locale('fa'),
                            branchIds: result.branchIds,
                            tonnageTypeIds: result.tonnageTypeIds,
                            farePercent: result.farePercent,
                            milkrunPercent: result.milkrunPercent,
                            rewardPercent: result.rewardPercent
                        }),
                        { headers: headers1 }
                    ).subscribe(() => {
                        this.fillGrid();
                        this.resetSelectedRowIds();
                    });
            }
        });
    }
    ///////
    onMove2AccGroup(): void {
        const dialogRef = this.dialog.open(AgendaMove2AccGroupDialog, {
            width: '300px',
            height: '430px',
            disableClose: true,
            data: {
                datePickerConfig: {
                    drops: 'down',
                    format: 'YY/M/D',
                    showGoToCurrent: 'true'
                },
                dialogTitle: 'ارسال گروهی  به حسابداری'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.state === 'successful') {
                const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
                this.http
                    .put(
                        this.getUrl() + 'GroupMoveToAcc/',
                        JSON.stringify({
                            fromDate: moment(result.fromDate).locale('fa'),
                            toDate: moment(result.toDate).locale('fa'),
                            branchIds: result.branchIds
                        }),
                        { headers: headers1 }
                    ).subscribe(() => {
                        this.fillGrid();
                        this.resetSelectedRowIds();
                    });
            }
        });
    }
    onPayCashAgenda(id: number): void {
        // const data = this.selectedRowIds[0].entity;
        // if (data == null) {
        //   this.SetReceiptForExternalAgenda();
        //   return;
        // } else if (!this.canSetReceipt(data)) {
        //   return;
        // }
        const currentDate = moment();
        const dialogRef = this.dialog.open(AgendaSetReceipt, {
            width: '300px',
            height: '410px',
            disableClose: true,
            data: {
                datePickerConfig: {
                    drops: 'down',
                    format: 'YY/M/D',
                    showGoToCurrent: 'true'
                },
                id: id,
                receivedDate: currentDate.locale('fa'),
                dialogTitle: 'تاریخ پرداخت بارنامه نقدی '
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (!this.authService.isReadOnlyUser)
                if (result && result.state === 'successful') {
                    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
                    this.http
                        .put(this.getUrl() + 'CashPayment/' + id,
                            JSON.stringify({
                                PayDate: result.date
                            }),
                            { headers: headers1 }
                        ).subscribe((res) => {
                            this.fillGrid();
                            this.resetSelectedRowIds();
                        });
                }
        });
    }
    onAgendaDelivered(): void {
        const msgText = this.selectedRowIds[0].entity.isDelivered ?
            'از تحویل داده شده به نمایندگی خارج شود؟' :
            'تحویل داده شده به نمایندگی؟';

        const dialogRef = this.dialog.open(ConfirmDialog, {
            width: '250px',
            data: {
                messageText: msgText
            }
        });

        dialogRef.afterClosed().subscribe(result => {

            if (!this.authService.isReadOnlyUser)
                if (result.state === 'confirmed') {
                    if (this.isOutTransTime()) {
                        this.onOutTransTime(this.selectedRowIds[0].entity.id);
                    } else {
                        this.setAgendaDelivered();
                    }
                    // this.selectedRowIds[0].entity.id
                    // this.dialogRef.close({data: null, state: "cancel"});
                }
        });
    }
    setAgendaDelivered() {
        if (!this.authService.isReadOnlyUser) {
            const headers1 = new HttpHeaders({
                'Content-Type': 'application/json'
            });
            this.http
                .put(
                    this.getUrl() + 'delivered/' + this.selectedRowIds[0].entity.id,
                    JSON.stringify({
                        State: 2
                    }),
                    { headers: headers1 }
                )
                .subscribe(() => {
                    this.resetSelectedRowIds();
                    this.fillGrid();
                });
        }
    }
    onAgendaCashBillPaid(): void {
        // const msgText = this.selectedRowIds[0].entity.isCashBillPaid ?
        //   'از نقدی پرداخت شده خارج شود؟' :
        //   'بارنامه نقدی پرداخت شود؟';

        // const dialogRef = this.dialog.open(ConfirmDialog, {
        //   width: '250px',
        //   data: {
        //     messageText: msgText
        //   }
        // });
        // dialogRef.afterClosed().subscribe(result => {
        //   if (result.state === 'confirmed') {
        //     // this.dialogRef.close({data: null, state: "cancel"});
        //     const headers1 = new HttpHeaders({
        //       'Content-Type': 'application/json'
        //     });
        //     this.http
        //       .put(
        //         this.getUrl() + 'isCashBillPaid/' + this.selectedRowIds[0].entity.id,
        //         JSON.stringify({
        //           State: 2
        //         }),
        //         { headers: headers1 }
        //       )
        //       .subscribe(() => {
        //         this.resetSelectedRowIds();
        //         this.fillGrid();
        //       });
        //   }
        // });
    }
    onChangeBranch(): void {
        const data = this.selectedRowIds[0].entity;
        if (data == null) {
            return;
        }
        if (data.branchId === this.authService.selectedBranchId) {
            return;
        }
        let msg = 'آیا از تغییر شعبه این صورتجلسه' + data.waybillNumber + ' اطمینان دارید؟';


        const dialogRef = this.dialog.open(ConfirmDialog, {
            width: '450px',
            data: {
                messageText: msg
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result.state === 'confirmed') {
                // this.dialogRef.close({data: null, state: "cancel"});
                const headers1 = new HttpHeaders({
                    'Content-Type': 'application/json'
                });
                this.http
                    .put(
                        this.getUrl() + 'changeBranch/' + this.selectedRowIds[0].entity.id,
                        JSON.stringify({
                            branchId: this.authService.selectedBranchId
                        }),
                        { headers: headers1 }
                    )
                    .subscribe(() => {
                        this.fillGrid();
                        this.resetSelectedRowIds();
                    });
            }
        });
    }
    onCancel(): void {
        const data = this.selectedRowIds[0].entity;
        if (data == null) {
            return;
        }
        if (!this.canSetReceipt(data)) {
            return;
        }
        let msg, st;
        if (data.state != 2) {
            msg = 'آیا از ابطال این صورتجلسه اطمینان دارید؟';
            st = 2;
        } else {
            msg = 'بارنامه از حالت ابطال خارج شود؟';
            st = 1;
        }


        const dialogRef = this.dialog.open(ConfirmDialog, {
            width: '250px',
            data: {
                messageText: msg
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result.state === 'confirmed') {
                // this.dialogRef.close({data: null, state: "cancel"});
                const headers1 = new HttpHeaders({
                    'Content-Type': 'application/json'
                });
                this.http
                    .put(
                        this.getUrl() + 'state/' + this.selectedRowIds[0].entity.id,
                        JSON.stringify({
                            State: st
                        }),
                        { headers: headers1 }
                    )
                    .subscribe(() => {
                        this.fillGrid();
                        this.resetSelectedRowIds();
                    });
            }
        });
    }

    canCancelAgenda(): boolean {
        const data = this.selectedRowIds[0].entity;
        if (data === undefined || data == null) {
            return false;
        } else if (data.state === 3) {
            return false;
        } else {
            return true;
        }
    }

    onShow(): void {
        const data = this.selectedRowIds[0].entity;
        if (data == null) {
            return;
        }

        const agent = new AgendaDetailDto(data);
        const dialogRef = this.dialog.open(AgendaDialog, {
            width: this.modalCordinate.width,
            height: this.modalCordinate.height,
            disableClose: true,
            data: {
                datePickerConfig: {
                    drops: 'down',
                    format: 'YY/M/D',
                    showGoToCurrent: 'true'
                },
                Agenda: agent,
                exportDate: moment(agent.exportDate).locale('fa'),
                dialogTitle: 'نمایش ',
                readOnly: true
            }
        });
        dialogRef.afterClosed().subscribe(result => { });
    }

    onDeleteById(id): void {
        this.deleteEntity(id);
    }

    canSetReceipt(agenda, showInfoIfAgendaCanceled: boolean = true): boolean {
        // if (agenda.state === AgendaState.Canceled) {
        //   if (showInfoIfAgendaCanceled) {
        //     this.snackBar.open('این بارنامه در وضعیت ابطال می باشد', 'خطا', {
        //       duration: 3000,
        //       panelClass: ['snack-bar-info']
        //     });
        //   }
        //   return false;
        // }
        if (agenda.state === AgendaState.Received) {
            this.snackBar.open(
                'برای این بارنامه قبلا تاریخ رسید ثبت شده است.  تاریخ رسید  = ' +
                agenda.persianReceivedDate,
                'خطا',
                {
                    duration: 3000,
                    panelClass: ['snack-bar-info']
                }
            );
            return false;
        }
        return true;
    }

    onAgentAgendasReport(): void {
        const url = '/v1/api/Report/AgentAgendas/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                CarManufacturerName: result['carManufacturerName'],
                CarManufacturerGroupName: result['carManufacturerGroupName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description'],
                Code: result['code'],
                Name: result['name']
            };
            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    AgendaNumber: row.agendaNumber,
                    ExportDate: moment(row.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    ReceivedDate:
                        row.receivedDate == null
                            ? ' '
                            : moment(row.receivedDate)
                                .locale('fa')
                                .format('YYYY/MM/DD'),
                    DriverName: row.driverName,
                    TrailerPlaque: row.trailerPlaque
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'AgentAgendas.mrt',
                options: null,
                dataSources,
                reportTitle: 'گزارش نمایندگی ها'
            });
            this.router.navigate(['form/report']);
        });
    }

    onDriverAgendasReport(): void {
        const url = '/v1/api/Report/DriverAgendas/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                CarManufacturerName: result['carManufacturerName'],
                CarManufacturerGroupName: result['carManufacturerGroupName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description'],
                Code: result['code'],
                Name: result['name']
            };
            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    AgendaNumber: row.agendaNumber,
                    ExportDate: moment(row.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    ReceivedDate:
                        row.receivedDate == null
                            ? ' '
                            : moment(row.receivedDate)
                                .locale('fa')
                                .format('YYYY/MM/DD'),
                    AgentCode: row.agentCode,
                    TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
                    Fare: row.fare,
                    PreFare: row.preFare,
                    Reward: row.reward,
                    RemainingFare: row.remainingFare,
                    State: row.state
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'DriverAgendas.mrt',
                options: null,
                dataSources,
                reportTitle: 'گزارش راننده'
            });

            this.router.navigate(['form/report']);
        });
    }

    onTrailerAgendasReport(): void {
        const url = '/v1/api/Report/TrailerAgendas/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                CarManufacturerName: result['carManufacturerName'],
                CarManufacturerGroupName: result['carManufacturerGroupName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description'],
                Code: result['code'],
                Name: result['name']
            };
            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    AgendaNumber: row.agendaNumber,
                    ExportDate: moment(row.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    ReceivedDate:
                        row.receivedDate == null
                            ? ' '
                            : moment(row.receivedDate)
                                .locale('fa')
                                .format('YYYY/MM/DD'),
                    AgentCode: row.agentCode,
                    DriverName: row.driverFullName,
                    Fare: row.fare,
                    PreFare: row.preFare,
                    Reward: row.reward,
                    RemainingFare: row.remainingFare,
                    State: row.state
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'TrailerAgendas.mrt',
                options: null,
                dataSources,
                reportTitle: 'گزارش تریلر'
            });

            this.router.navigate(['form/report']);
        });
    }

    onAgendaListReport(reportType: number): void {
        let url = '/v1/api/Report/AgendaList/';
        let reportName = '';
        let reportTitle = '';
        if (reportType === 0) {
            url = '/v1/api/Report/AgendaListMilk/';
            reportName = 'AgendaListMilk.mrt';
            reportTitle = 'گزارش میلک  ';
        }
        else if (reportType === 1) {
            reportName = 'AgendaGeteList.mrt';
            reportTitle = 'گزارش بارنامه‌های حمل‌قطعه ';
        }
        else if (reportType === 2) {
            reportName = 'AgendaBadaneList.mrt';
            reportTitle = 'گزارش بارنامه های حمل بدنه ';
        } else if (reportType === 3) {
            reportName = 'AgendaListTafsili.mrt';
            reportTitle = 'گزارش تفصیلی صورتحساب';
        } else if (reportType === 4) {
            reportName = 'AgendaListPreFarePayDate.mrt';
            reportTitle = ' تاریخ پرداخت پیشکرایه';
        } else if (reportType === 5) {
            reportName = 'AgendaListTasvie.mrt';
            reportTitle = ' بارنامه های تسویه شده/نشده';
        } else if (reportType === 6) {
            url = '/v1/api/Report/AgendaListDrvr/';
            reportName = 'AgendaList1.mrt';
            reportTitle = 'صورتحساب عملیات رانندگان ';
        } else {
            reportName = 'AgendaList1.mrt';
            reportTitle = 'صورتحساب مالی رانندگان ';
        }

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                CarManufacturerName: result['carManufacturerName'],
                CarManufacturerGroupName: result['carManufacturerGroupName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: reportTitle,
                Code: result['code'],
                Name: result['name']
            };
            // const branches = [];
            // result['branches'].forEach(row => {
            //   branches.push({
            //     BranchTitle: row.branchTitle,
            //     Count: row.count
            //   });
            // });
            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    AgendaNumber: row.agendaNumber,
                    ExportDate: moment(row.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    ReceivedDate:
                        row.receivedDate == null
                            ? ' '
                            : moment(row.receivedDate)
                                .locale('fa')
                                .format('YYYY/MM/DD'),
                    IsRecived: row.receivedDate == null ? 'رسید نشده' : 'رسیدشده',
                    InvoiceNumber: row.invoiceNumber,
                    IsInvoiced: row.invoiceNumber?.length > 0 ? 'تسویه شده' : 'تسویه نشده',
                    AgentCode: row.agentCode,
                    TargetCity: row.targetCity,
                    DriverName: row.driverFullName,
                    DriverBankAccountNumber: row.driverBankAccountNumber,
                    TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
                    TrailerTafsili: row.trailerTafsili,
                    Fare: row.fare,
                    PreFare: row.preFare,
                    Reward: row.reward,
                    CarCount: row.carCount,
                    RemainingFare: row.remainingFare,
                    MilkRun: row.milkRun,
                    State: row.state,
                    IsCashBill: row.isCashBill,
                    IsCashBillPaid: row.isCashBillPaid,
                    IsPreFarePaid: row.isPreFarePaid,
                    PreFarePayDate: row.preFarePayDate == null
                        ? ' '
                        : moment(row.preFarePayDate)
                            .locale('fa')
                            .format('YYYY/MM/DD'),
                    BranchTitle: row.branchTitle,
                    BranchId: row.branchId,
                    MilkRunCount: row.milkRunCount
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });

            ReportService.setReportViewModel({
                reportName: reportName,
                options: null,
                dataSources,
                reportTitle: reportTitle
            });

            this.router.navigate(['form/report']);
        });
    }
    onAgendaMaxFareReport(): void {
        let url = '/v1/api/Report/AgendaMaxFare/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                CarManufacturerName: result['carManufacturerName'],
                CarManufacturerGroupName: result['carManufacturerGroupName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: 'بارنامه های با کرایه بالاتر از محدوده',
                Code: result['code'],
                Name: result['name']
            };
            // const branches = [];
            // result['branches'].forEach(row => {
            //   branches.push({
            //     BranchTitle: row.branchTitle,
            //     Count: row.count
            //   });
            // });
            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    AgendaNumber: row.agendaNumber,
                    ExportDate: moment(row.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    AgentCode: row.agentCode,
                    TargetCity: row.targetCity,
                    DriverName: row.driverFullName,
                    TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
                    Fare: row.fare,
                    PreFare: row.preFare,
                    Reward: row.reward,
                    CarCount: row.carCount,
                    RemainingFare: row.remainingFare,
                    MilkRun: row.milkRun,
                    BranchTitle: row.branchTitle,
                    TotalFarePercent: row.totalFarePercent,
                    FactoryFare: row.factoryFare,
                    SumFare: row.sumFare,
                    MilkRunCount: row.milkRunCount
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });

            ReportService.setReportViewModel({
                reportName: 'AgendaMaxFare.mrt',
                options: null,
                dataSources,
                reportTitle: 'بارنامه های با کرایه بالاتر از محدوده'
            });

            this.router.navigate(['form/report']);
        });
    }

    onAgendaSUVReport(): void {
        const url = '/v1/api/Report/AgendaSUV/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                CarManufacturerName: result['carManufacturerName'],
                CarManufacturerGroupName: result['carManufacturerGroupName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description'],
                Code: result['code'],
                Name: result['name']
            };
            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    AgendaNumber: row.agendaNumber,
                    ExportDate: moment(row.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    AgentCode: row.agentcode,
                    TargetCity: row.targetCity,
                    DriverName: row.driverFullName,
                    TrailerPlaque: row.trailerPlaque
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'AgendaSUV.mrt',
                options: null,
                dataSources,
                reportTitle: 'گزارش بارنامه'
            });

            this.router.navigate(['form/report']);
        });
    }
    onAgendaBankReport(reportType: AgendaBankReportType): void {
        let reportName = (reportType as AgendaBankReportType) == AgendaBankReportType.Varizy ?
        'AgendaVarizyBank.mrt':'AgendaBank.mrt'
        reportType = reportType == AgendaBankReportType.Varizy ? AgendaBankReportType.PreFare : reportType;
        const url = '/v1/api/Report/AgendaBankReport/' + reportType;

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                CarManufacturerName: result['carManufacturerName'],
                CarManufacturerGroupName: result['carManufacturerGroupName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description'],
                Code: result['code'],
                Name: result['name']
            };
            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    Fare: row.fare,
                    AccNumber: row.accNumber?.trim(),
                    ErjaaId: row.erjaaId?.trim(),
                    AccOwner: row.accOwner?.trim(),
                    Plaque: row.plaque?.trim(),
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: reportName,
                options: null,
                dataSources,
                reportTitle: reportType == AgendaBankReportType.PreFare ?
                    'گزارش بانک برای پیشکرایه' : reportType == AgendaBankReportType.Reward ?
                        'گزارش بانک برای انعام' : 'گزارش بانک برای باقیمانده کرایه'
            });

            this.router.navigate(['form/report']);
        });
    }
    onAgendaPerProvinceReport(): void {
        const url = '/v1/api/Report/AgendaPerProvince/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description']
            };
            const provinces = [];
            result['provinces'].forEach(row => {
                provinces.push({
                    ProvinceName: row.provinceName,
                    Count: row.count,
                    TotalCar: row.totalCar
                });
            });
            const cityDetail = [];
            result['details'].forEach(row => {
                cityDetail.push({
                    CityName: row.cityName,
                    ProvinceName: row.provinceName,
                    Count: row.count,
                    TotalCar: row.totalCar
                });
            });
            const dataSources = JSON.stringify({
                Provinces: provinces,
                CityDetail: cityDetail,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'CarsPerCity.mrt',
                options: null,
                dataSources,
                reportTitle: 'گزارش بارنامه به تفکیک استان '
            });

            this.router.navigate(['form/report']);
        });
    }
    onBranchwiseInvoiceReport(): void {
        const url = '/v1/api/Report/BranchwiseInvoice/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description']
            };
            const detail = [];
            result['details'].forEach(row => {
                detail.push({
                    BranchName: row.branchName.replace('شعبه', ''),
                    Count_Type1: row.count_Type1,
                    Count_Type2: row.count_Type2
                });
            });
            const dataSources = JSON.stringify({
                BranchwiseInvoiceDetail: detail,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'BranchwiseInvoice.mrt',
                options: null,
                dataSources,
                reportTitle: 'تسویه شده / نشده به تفکیک شعبه'
            });

            this.router.navigate(['form/report']);
        });
    }
    onAgendaPerDriverReport(): void {
        const url = '/v1/api/Report/AgendaPerDriver/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description']
            };
            const detail = [];
            result['details'].forEach(row => {
                detail.push({
                    DriverFullName: row.driverFullName,
                    SmartCardNumber: row.smartCardNumber,
                    Count: row.count
                });
            });
            const dataSources = JSON.stringify({
                DriverDetail: detail,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'AgendaPerDriver.mrt',
                options: null,
                dataSources,
                reportTitle: 'کارکرد رانندگان '
            });

            this.router.navigate(['form/report']);
        });
    }
    onDriverBargiriReport(): void {
        const url = '/v1/api/Report/DriverBargiri/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description']
            };
            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    AgendaNumber: row.agendaNumber,
                    ExportDate: moment(row.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    SenderBranch: row.senderBranch.replace('شعبه', ''),
                    Reciver: row.reciver,
                    TrailerPlaque: row.trailerPlaque,
                    DriverName: row.driverName,
                    Phone: row.phone,
                });
            });
            const dataSources = JSON.stringify({
                detailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'DriverBargiri.mrt',
                options: null,
                dataSources,
                reportTitle: 'بارگیری رانندگان '
            });

            this.router.navigate(['form/report']);
        });
    }

    onAgendaGroupByDriverReport(): void {
        const url = '/v1/api/Report/AgendaGroupByDriver/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description']
            };
            const drivers = [];
            result['drivers'].forEach(row => {
                drivers.push({
                    DriverFullName: row.driverFullName,
                    SmartCardNumber: row.smartCardNumber,
                    Count: row.count
                });
            });
            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    AgendaNumber: row.agendaNumber,
                    ExportDate: moment(row.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    ReceivedDate:
                        row.receivedDate == null
                            ? ' '
                            : moment(row.receivedDate)
                                .locale('fa')
                                .format('YYYY/MM/DD'),
                    AgentCode: row.agentCode,
                    DriverSmartCardNumber: row.driverSmartCardNumber,
                    DriverName: row.driverName
                });
            });
            const dataSources = JSON.stringify({
                DriverDetail: drivers,
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'AgendaGroupByDriver.mrt',
                options: null,
                dataSources,
                reportTitle: 'کارکرد رانندگان '
            });

            this.router.navigate(['form/report']);
        });
    }

    onAgendaGroupByTrailerReport(): void {
        const url = '/v1/api/Report/AgendaGroupByTrailer/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description']
            };
            const trailers = [];
            result['trailers'].forEach(row => {
                trailers.push({
                    Plaque: row.plaque,
                    SmartCardNumber: row.smartCardNumber,
                    Count: row.count
                });
            });
            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    AgendaNumber: row.agendaNumber,
                    ExportDate: moment(row.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    ReceivedDate:
                        row.receivedDate == null
                            ? ' '
                            : moment(row.receivedDate)
                                .locale('fa')
                                .format('YYYY/MM/DD'),
                    AgentCode: row.agentCode,
                    SmartCardNumber: row.smartCardNumber,
                    Plaque: row.plaque
                });
            });
            const dataSources = JSON.stringify({
                TrailerDetail: trailers,
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'AgendaGroupByTrailer.mrt',
                options: null,
                dataSources,
                reportTitle: 'کارکرد تریلر '
            });

            this.router.navigate(['form/report']);
        });
    }
    onAgendaGroupByTonnageTypeReport(): void {
        const url = '/v1/api/Report/AgendaGroupByTonnageType/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description']
            };
            const rows = [];
            result['details'].forEach(row => {
                rows.push({
                    TonnageTypeName: row.tonnageTypeName,
                    BranchName: row.branchName,
                    Count: row.count
                });
            });
            // const detailRows = [];
            // result['details'].forEach(row => {
            //   detailRows.push({
            //     AgendaNumber: row.agendaNumber,
            //     ExportDate: moment(row.exportDate)
            //       .locale('fa')
            //       .format('YYYY/MM/DD'),
            //     ReceivedDate:
            //       row.receivedDate == null
            //         ? ' '
            //         : moment(row.receivedDate)
            //           .locale('fa')
            //           .format('YYYY/MM/DD'),
            //     AgentCode: row.agentCode,
            //     SmartCardNumber: row.smartCardNumber,
            //     Plaque: row.plaque
            //   });
            // });
            const dataSources = JSON.stringify({
                // TrailerDetail: rows,
                DetailRows: rows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'AgendaGroupByTonnageType.mrt',
                options: null,
                dataSources,
                reportTitle: 'کارکرد برحسب نوع بارگیر '
            });

            this.router.navigate(['form/report']);
        });
    }
    onAgendaKafRentReport(): void {
        const url = '/v1/api/Report/AgendaKafRent/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: ' گزارش کفهای اجاره‌ای '
            };

            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    Plaque: row.plaque,
                    DriverName: row.driverName,
                    AgendaCount: row.agendaCount,
                    BranchName: row.branchName,
                    Destination: row.destination,
                    KafCode: row.kafCode,
                    DriverMobile: row.driverMobile,
                    ExportDate: row.persianExportDate
                });
            });
            // detailRows.sort((a, b) => (a.trailerPlaque > b.trailerPlaque) ? 1 :
            //   ((b.trailerPlaque > a.trailerPlaque) ? -1 : 0));
            detailRows.sort((a, b) => (a.Plaque < b.Plaque ? -1 : 1));
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'AgendaKafRent.mrt',
                options: null,
                dataSources,
                reportTitle: ' گزارش کفهای اجاره‌ای '
            });

            this.router.navigate(['form/report']);
        });
    }
    onKafWithoutServiceReport(): void {
        const url = '/v1/api/Report/KafWithoutService/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: ' گزارش کفهای بدون بارگیری '
            };

            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    Plaque: row.plaque,
                    DriverName: row.driverName,
                    KafCode: row.kafCode,
                    DriverMobile: row.driverMobile
                });
            });
            // detailRows.sort((a, b) => (a.trailerPlaque > b.trailerPlaque) ? 1 :
            //   ((b.trailerPlaque > a.trailerPlaque) ? -1 : 0));
            detailRows.sort((a, b) => (a.Plaque < b.Plaque ? -1 : 1));
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'KafWithoutService.mrt',
                options: null,
                dataSources,
                reportTitle: ' گزارش کفهای بدن بارگیری '
            });

            this.router.navigate(['form/report']);
        });
    }
    onAgendaFareContractReport(options: { groupByContract?: boolean, groupByBranch?: boolean, groupBySender?: boolean }): void {
        let url: string
        let reportName: string
        let dsc: string

        if (options.groupByContract) {
            url = '/v1/api/Report/AgendaFareContract/';
            dsc = 'گزارش حسابرسی بر اساس شماره قرارداد'
            reportName = 'AgendaFareContract.mrt'
        }

        else if (options.groupByBranch) {
            url = '/v1/api/Report/BranchFareContract/';
            dsc = 'گزارش حسابرسی بر اساس  شعبه'
            reportName = 'BranchFareContract.mrt'
        }

        else if (options.groupBySender) {
            url = '/v1/api/Report/AgendaSender/';
            dsc = 'گزارش حسابرسی بر اساس  فرستنده/گیرنده'
            reportName = 'AgendaSender1.mrt'
        }

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                AgentName: result['carManufacturerName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: dsc
            };

            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    FareContract: row.fareContract,
                    BranchName: row.branchName,
                    AgendaCount: row.agendaCount,
                    Fare: row.fare,
                    MilkRun: row.milkRun,
                    PreFare: row.preFare,
                    Reward: row.reward,
                    RemainingFare: row.remainingFare,
                    FactoryFare: row.factoryFare,
                    CarCount: row.carCount
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: reportName,
                options: null,
                dataSources,
                reportTitle: ' گزارش قراردادها '
            });

            this.router.navigate(['form/report']);
        });
    }
    onMilkRunReportReport(type: number): void {
        let reportTitle, reportName;
        let url;
        if (type == 0) {
            url = '/v1/api/Report/MilkRun/false';
            reportTitle = 'گزارش میلک ران  ';
            reportName = 'MilkRunReport.mrt';
        }
        else if (type == 1) {
            url = '/v1/api/Report/MilkRun/true';
            reportTitle = 'گزارش میلک ران  ';
            reportName = 'MilkRunReport.mrt';
        }
        else if (type == 2) {
            url = '/v1/api/Report/DiffrenceCarCount/';
            reportTitle = 'گزارش اختلاف تعداد بدنه  ';
            reportName = 'DiffrenceCarCount.mrt';
        }

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description']
            };
            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    AgendaNumber: row.agendaNumber,
                    ExportDate: moment(row.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    DriverName: row.driverName,
                    Title: row.title,
                    BranchName: row.branchName,
                    AgendaCarCount: row.agendaCarCount,
                    CarCount: row.carCount,
                    AgendaMilkRunCount: row.agendaMilkRunCount,
                    MilkCount: row.milkCount,
                    ProvinceName: row.provinceName,
                    Plaque: row.plaque.replace('ایران', '-')
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: reportName,
                options: null,
                dataSources,
                reportTitle: reportTitle
            });

            this.router.navigate(['form/report']);
        });
    }
    onAggAgendaBadaneReport(): void {
        let reportName = 'AggregateAgendaBadane.mrt';
        let reportTitle = 'صورت مدارک حمل بدنه';

        const url = '/v1/api/Report/AggAgendaBadane/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                PrintDate: moment()
                    .locale('fa')
                    .format('YYYY/MM/DD       HH:mm')
            };

            const detailRows = [];
            result['details'].forEach(item => {
                detailRows.push({
                    CargoCode: item.cargoCode,
                    WaybillNumber: item.waybillNumber,
                    WaybillSeries: item.waybillSeries,
                    ExportDate: moment(item.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    Plaque: item.plaque,
                    Province: item.province,
                    Cities: item.cities,
                    FactoryFare: item.factoryFare,
                    FareContract: item.fareContract,
                    SumRow: item.carCount
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: reportName,
                options: null,
                dataSources,
                reportTitle: reportTitle
            });

            this.router.navigate(['form/report']);
        });
    }
    onAggAgendaReport(isForEsico: boolean): void {
        let reportName = '';
        let reportTitle = '';

        if (isForEsico) {
            reportName = 'EsicoReport.mrt';
            reportTitle = 'گزارش  ایسیکو ';
        } else {
            reportName = 'AggregateAgenda.mrt';
            reportTitle = 'صورت مدارک حمل';
        }
        const url = '/v1/api/Report/AggregateAgenda/' + isForEsico;

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                HdrCol1: result['hdrCol1'],
                HdrCol2: result['hdrCol2'],
                HdrCol3: result['hdrCol3'],
                HdrCol4: result['hdrCol4'],
                HdrCol5: result['hdrCol5'],
                HdrCol6: result['hdrCol6'],
                HdrCol7: result['hdrCol7'],
                HdrCol8: result['hdrCol8'],
                HdrCol9: result['hdrCol9'],
                HdrCol10: result['hdrCol10'],
                PrintDate: moment()
                    .locale('fa')
                    .format('YYYY/MM/DD       HH:mm')
            };

            const detailRows = [];
            result['details'].forEach(item => {
                detailRows.push({
                    CargoCode: item.cargoCode,
                    WaybillNumber: item.waybillNumber,
                    WaybillSeries: item.waybillSeries,
                    ExportDate: moment(item.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    Plaque: item.plaque,
                    Province: item.province,
                    Cities: item.cities,
                    FactoryFare: item.factoryFare,
                    C1: item.c1,
                    C2: item.c2,
                    C3: item.c3,
                    C4: item.c4,
                    C5: item.c5,
                    C6: item.c6,
                    C7: item.c7,
                    C8: item.c8,
                    C9: item.c9,
                    C10: item.c10,
                    SumRow:
                        item.c1 +
                        item.c2 +
                        item.c3 +
                        item.c4 +
                        item.c5 +
                        item.c6 +
                        item.c7 +
                        item.c8 +
                        item.c9 +
                        item.c10
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: reportName,
                options: null,
                dataSources,
                reportTitle: reportTitle
            });

            this.router.navigate(['form/report']);
        });
    }
    onIranKhodroReport(): void {

        const url = '/v1/api/Report/IranKhodroReport/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                PrintDate: moment()
                    .locale('fa')
                    .format('YYYY/MM/DD       HH:mm')
            };

            const detailRows = [];
            let i = 0;
            let bNo = '';
            result['details'].forEach(item => {
                if (bNo == '' || bNo != item.waybillNumber) {
                    bNo = item.waybillNumber;
                    i++;
                }

                detailRows.push({
                    Indx: i,
                    WaybillNumber: item.waybillNumber,
                    WaybillSeries: item.waybillSeries,
                    BodyNumber: item.bodyNumber,
                    BranchCity: item.branchCity,
                    MaghsadNahaee: item.maghsadNahaee,
                    Namayandegi: item.namayandegi,
                    NamayandgiCityName: item.namayandgiCityName,
                    NamayandegiProvincename: item.namayandegiProvincename,
                    ExportDate: moment(item.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    ZonkanNo: item.zonkanNo,
                    CoName: item.coName,
                    Plaque: item.plaque,
                    TonnageTypeName: item.tonnageTypeName,
                    DriverName: item.driverName,
                    CarGroupName: item.carGroupName,
                    ExitTiime: item.exitTiime,
                    CarTypeName: item.carTypeName,
                    ExternalNumber: item.externalNumber,
                    CargoCode: item.cargoCode,
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'IranKhodroReport11.mrt',
                options: null,
                dataSources,
                reportTitle: 'گزارش ایران خودرو'
            });

            this.router.navigate(['form/report']);
        });
    }
    onAggAgendaProvinceReport(): void {
        const url = '/v1/api/Report/AggregateAgenda/false';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                HdrCol1: result['hdrCol1'],
                HdrCol2: result['hdrCol2'],
                HdrCol3: result['hdrCol3'],
                HdrCol4: result['hdrCol4'],
                HdrCol5: result['hdrCol5'],
                HdrCol6: result['hdrCol6'],
                HdrCol7: result['hdrCol7'],
                HdrCol8: result['hdrCol8'],
                HdrCol9: result['hdrCol9'],
                HdrCol10: result['hdrCol10'],
                PrintDate: moment()
                    .locale('fa')
                    .format('YYYY/MM/DD       HH:mm')
            };

            const detailRows = [];
            result['details'].forEach(item => {
                detailRows.push({
                    CargoCode: item.cargoCode,
                    WaybillNumber: item.waybillNumber,
                    WaybillSeries: item.waybillSeries,
                    ExportDate: moment(item.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    Plaque: item.plaque,
                    Province: item.province,
                    Cities: item.cities,
                    FactoryFare: item.factoryFare,
                    C1: item.c1,
                    C2: item.c2,
                    C3: item.c3,
                    C4: item.c4,
                    C5: item.c5,
                    C6: item.c6,
                    C7: item.c7,
                    C8: item.c8,
                    C9: item.c9,
                    C10: item.c10,
                    SumRow:
                        item.c1 +
                        item.c2 +
                        item.c3 +
                        item.c4 +
                        item.c5 +
                        item.c6 +
                        item.c7 +
                        item.c8 +
                        item.c9 +
                        item.c10
                });
            });
            const dataSources = JSON.stringify({
                DetailRows: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'AggregateAgendaProvince.mrt',
                options: null,
                dataSources,
                reportTitle: 'صورت مدارک حمل'
            });

            this.router.navigate(['form/report']);
        });
    }
    onMali1Report(n: number): void {
        const url = '/v1/api/Report/Mali1/';
        let ReportTitle, AgendaNumberTitle;
        switch (n) {
            case 0: {
                ReportTitle = 'گزارش پیشکرایه ';
                AgendaNumberTitle = ' بابت خرج راه بارنامه';
                break;
            }
            case 1: {
                ReportTitle = 'گزارش کارکرد ';
                AgendaNumberTitle = ' بابت بارنامه';
                break;
            }
            case 2: {
                ReportTitle = 'گزارش انعام ';
                AgendaNumberTitle = ' بابت اضافه کرایه بارنامه';
                break;
            }
            case 3: {
                ReportTitle = 'گزارش واریز نقدی ';
                AgendaNumberTitle = ' بابت اضافه کرایه بارنامه';
                break;
            }
            case 4: {
                ReportTitle = 'گزارش میلک ران ';
                AgendaNumberTitle = ' بابت Milkrun بارنامه';
                break;
            }
        }
        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
            const hdr = {
                BranchName: result['branchName'],
                CompanyName: result['companyName'],
                FromDate: moment(result['fromDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                ToDate: moment(result['toDate'])
                    .locale('fa')
                    .format('YYYY/MM/DD'),
                Description: result['description'],
                PreFareTitle: n === 0 ? 'بدهکار' : 'بستانکار',
                ReportTitle: ReportTitle
            };

            const detailRows = [];
            result['details'].forEach(row => {
                detailRows.push({
                    AgendaNumber: AgendaNumberTitle + row.agendaNumber,
                    ExportDate: moment(row.exportDate)
                        .locale('fa')
                        .format('YYYY/MM/DD'),
                    PreFare: n === 0 ? row.preFare : n === 1 ? row.fare : n === 2 ? row.reward : row.milkRun,
                    // Fare: row.Fare,
                    TafsiliAccount: row.tafsiliAccount,
                    TotalAccount: row.totalAccount,
                    MoeenAccount: row.moeenAccount,
                    Markaz: row.markaz,
                    Project: row.project,
                    BranchTitle: row.branchTitle,
                    BranchId: row.branchId

                });
            });
            const dataSources = JSON.stringify({
                Mali: detailRows,
                ReportTitle: hdr
            });
            ReportService.setReportViewModel({
                reportName: 'Mali2.mrt',
                options: null,
                dataSources,
                reportTitle: n === 1 ? 'گزارش  کارکرد ' : 'گزارش پیشکرایه '
            });

            this.router.navigate(['form/report']);
        });
    }
    getUrl() {
        return '/v1/api/Agenda/';
    }

    onClose(): void { }

    // onSetCarCount() {
    //   this.http.get('/v1/api/Agenda/SetCarAmount').subscribe(result => {
    //     console.log(result);
    //   });
    // }
    onSelect({ item }) {
        console.log(item.code);
        switch (item.code) {
            case 'new': {
                this.onCreate();
                break;
            }
            case 'recept': {
                this.SetReceiptForExternalAgenda();
                break;
            }
            case 'cancel': {
                this.onCancel();
                break;
            }
            case 'changeBranch': {
                this.ChangeAgendaBranch();
                break;
            }
            case 'CheckoutTrailer': {
                this.CheckoutTrailer();
                break;
            }
            case 'GroupPaid': {
                this.onSetReceiptGroup();
                break;
            }
            case 'GroupMove2Acc': {
                this.onMove2AccGroup();
                break;
            }
            case 'ImportFromExcel': {
                this.onImportFromExcel();
                break;
            }
            case 'GroupPrefarePaid': {
                this.onSetGroupPrefarePaid();
                break;
            }
            // case 'UnpaidBMonth': {
            //   this.listAgendaNotPaid();
            //   break;
            // }
            case 'Invoice': {
                this.onInvoicePrintPreview();
                break;
            }
            case 'ChangeFare': {
                this.onChangeFare();
                break;
            }
            case 'ListAgendaCars': {
                this.agendaService.onAgendaCarsReport(this.selectedRowIds[0]['entity'].id);
                break;
            }
            case 'AgentAgendasReport': {
                this.onAgentAgendasReport();
                break;
            }
            case 'DriverAgendasReport': {
                this.onDriverAgendasReport();
                break;
            }
            case 'TrailerAgendasReport': {
                this.onTrailerAgendasReport();
                break;
            }
            case 'AgendaMaxFareReport': {
                this.onAgendaMaxFareReport();
                break;
            }
            case 'AgendaListMilkReport': {
                this.onAgendaListReport(0);
                break;
            }

            case 'AgendaGeteListReport': {
                this.onAgendaListReport(1);
                break;
            }
            case 'AgendaBadaneListReport': {
                this.onAgendaListReport(2);
                break;
            }
            case 'AgendaListTafsiliReport': {
                this.onAgendaListReport(3);
                break;
            }
            case 'AgendaListPreFarePayDateReport': {
                this.onAgendaListReport(4);
                break;
            }
            case 'AgendaListTasvieReport': {
                this.onAgendaListReport(5);
                break;
            }
            case 'AgendaListDrvrReport': {
                this.onAgendaListReport(6);
                break;
            }
            case 'AgendaListReport': {
                this.onAgendaListReport(10);
                break;
            }
            case 'AgendaSUVReport': {
                this.onAgendaSUVReport();
                break;
            }
            case 'BranchwiseInvoiceReport': {
                this.onBranchwiseInvoiceReport();
                break;
            }
            case 'AgendaVarizyBankReport': {
                this.onAgendaBankReport(AgendaBankReportType.Varizy);
                break;
            }
            case 'AgendaBankPreFareReport': {
                this.onAgendaBankReport(AgendaBankReportType.PreFare);
                break;
            }
            case 'AgendaBankRewardReport': {
                this.onAgendaBankReport(AgendaBankReportType.Reward);
                break;
            }
            case 'AgendaBankRemainingFareReport': {
                this.onAgendaBankReport(AgendaBankReportType.RemainingFare);
                break;
            }
            case 'AgendaVarizyBankReport': {
                this.onAgendaBankReport(AgendaBankReportType.Varizy);
                break;
            }

            case 'AgendaPerProvinceReport': {
                this.onAgendaPerProvinceReport();
                break;
            }
            case 'AgendaPerDriverReport': {
                this.onAgendaPerDriverReport();
                break;
            }
            case 'DriverBargiriReport': {
                this.onDriverBargiriReport();
                break;
            }
            case 'AgendaGroupByDriverReport': {
                this.onAgendaGroupByDriverReport();
                break;
            }
            case 'AgendaGroupByTrailerReport': {
                this.onAgendaGroupByTrailerReport();
                break;
            }
            case 'AgendaGroupByTonnageTypeReport': {
                this.onAgendaGroupByTonnageTypeReport();
                break;
            }
            case 'AgendaKafRentReport': {
                this.onAgendaKafRentReport();
                break;
            }
            case 'KafWithoutServiceReport': {
                this.onKafWithoutServiceReport();
                break;
            }
            case 'AgendaFareContractReport': {
                this.onAgendaFareContractReport({ groupByContract: true });
                break;
            }
            case 'BranchFareContractReport': {
                this.onAgendaFareContractReport({ groupByBranch: true });
                break;
            }
            case 'AgendaSenderReport': {
                this.onAgendaFareContractReport({ groupBySender: true });
                break;
            }
            case 'MilkRunReport': {
                this.onMilkRunReportReport(0);
                break;
            }
            case 'DiffrenceMilkRunReport': {
                this.onMilkRunReportReport(1);
                break;
            }
            case 'DiffrenceCarCount': {
                this.onMilkRunReportReport(2);
                break;
            }
            case 'Mali1Report1': {
                this.onMali1Report(0);
                break;
            }
            case 'Mali1Report2': {
                this.onMali1Report(1);
                break;
            }
            case 'Mali1Report3': {
                this.onMali1Report(2);
                break;
            }
            case 'Mali1Report4': {
                this.onMali1Report(4);
                break;
            }
            case 'EsicoReprot': {
                this.onAggAgendaReport(true);
                break;
            }
            case 'AggProvinceOnly': {
                this.onAggAgendaProvinceReport();
                break;
            }
            case 'AggProvinceCity': {
                this.onAggAgendaReport(false);
                break;
            }
            case 'AggAgendaBadaneReport': {
                this.onAggAgendaBadaneReport();
                break;
            }
            case 'IranKhodroReport': {
                this.onIranKhodroReport();
                break;
            }
        }
    }
    // CheckoutLimit(dt: string): number {
    //   const thisDate = moment(dt);
    //   const currentDate = new Date().toLocaleString();
    //   // this.diffInDays = this.firstDate.diff(this.secondDate, 'days')
    //   return Math.abs(thisDate.diff(currentDate, 'days'));
    // }
    CheckoutTrailer(): void {
        const title = 'تسویه حساب تریلر';
        const dialogRef = this.dialog.open(PaidCashInvoiceDialog, {
            disableClose: true,
            width: '1100px',
            height: '700px',
            data: {
                trailerId: this.selectedRowIds[0].entity.trailerId,

                invoice: {
                    registeredDate: moment().locale('fa'),
                    invoiceNumber: '',
                    description: ''
                },
                dialogTitle: title,
                isEdit: false,
                isTrailerCheckout: true
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            // if (result && result.state === 'successful') {
            this.fillGrid();
            this.selectedRowIds = [];
            // }
        });

    }
    onCashPayConfirm(id: number): void {


        const dialogRef = this.dialog.open(ConfirmDialog, {
            width: '250px',
            data: {
                messageText: 'تایید پرداخت نقدی بارنامه؟!!!'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!this.authService.isReadOnlyUser)
                if (result.state === 'confirmed') {
                    const headers1 = new HttpHeaders({
                        'Content-Type': 'application/json'
                    });
                    this.http
                        .put(
                            this.getUrl() + 'CashPaidConfirme/' + id,
                            JSON.stringify({
                                State: 2
                            }),
                            { headers: headers1 }
                        )
                        .subscribe(() => {
                            this.resetSelectedRowIds();
                            this.fillGrid();
                        });
                }
        });
    }
    onPreFarePaid(id: number): void {

        const dialogRef = this.dialog.open(ConfirmDialog, {
            width: '250px',
            data: {
                messageText: 'تایید پرداخت پیشکرایه بارنامه؟!!!'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!this.authService.isReadOnlyUser)
                if (result.state === 'confirmed') {
                    const headers1 = new HttpHeaders({
                        'Content-Type': 'application/json'
                    });
                    this.http
                        .put(
                            this.getUrl() + 'PreFarePaid/' + id,
                            JSON.stringify({
                                State: 2
                            }),
                            { headers: headers1 }
                        )
                        .subscribe(() => {
                            this.resetSelectedRowIds();
                            this.fillGrid();
                        });
                }
        });
    }
    onPaidlvl2(id: number): void {
        const dialogRef = this.dialog.open(ConfirmDialog, {
            width: '250px',
            data: {
                messageText: 'تایید پرداخت بارنامه حمل قطعه؟!!!'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result.state === 'confirmed') {
                const headers1 = new HttpHeaders({
                    'Content-Type': 'application/json'
                });
                this.http
                    .put(
                        this.getUrl() + 'Paidlvl2/' + id,
                        JSON.stringify({
                            State: 2
                        }),
                        { headers: headers1 }
                    )
                    .subscribe(() => {
                        this.resetSelectedRowIds();
                        this.fillGrid();
                    });
            }
        });
    }
    // onDiffrenceCarCount(): void {
    //   let f: FilterDescriptor;
    //   f = {
    //     field: "DiffrenceCarCount",
    //     operator: "contains",
    //     value: 1
    //   };
    //   this.state.filter.filters = this.state.filter.filters.filter(item => JSON.stringify(item) != JSON.stringify(f));
    //   this.chechDiffrenceCarCount = !this.chechDiffrenceCarCount;
    //   if (this.chechDiffrenceCarCount) {
    //     this.state.filter.filters.push(f);
    //   }
    //   this.fillGrid();
    //   this.setState(this.gridName, this.state);
    // }
    ngOnDestroy() {
        this.destroy$.next(true);
        // Now let's also unsubscribe from the subject itself:
        this.destroy$.unsubscribe();
    }
    public onSelectionChange(event: SelectionEvent): void {
        const selectedRows = event.selectedRows;
        const selectedDataItems = selectedRows.map(row => row.dataItem);
        console.log('Selected data items:', selectedDataItems);
    }
}
