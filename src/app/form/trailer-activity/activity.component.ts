import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'jalali-moment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../../core/services/app-auth-n.service';
import { IntlService } from '@progress/kendo-angular-intl';
import { GridService } from '../../shared/services/grid.service';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';


import * as Models from '../../shared/_models/persian-date';
import * as Interfaces from '../../shared/_interfaces/persian-date';
import { ReportService } from '../../shared/services/report-service';
import { InvoiceService } from '../invoice/invoice.service';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { IPrintDetail } from './PrintDetail';
import { InvoicePrintDetail } from './dtos/printActivityList';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { trailerActivityFormState } from './dtos/form-state';


type TrailerTafsili = {
  plaque: string;
  remainingFare: number;
  agendaNumber: string;
  tafsili: string;
  totalAccount: string;
  moeenAccount: string;
  markaz: string;
  project: string;
  branchTitle: string;
}
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'activity',
  templateUrl: './activity.component.html',
})
export class ActivityComponent implements OnDestroy {

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  branchs = [];
  tonnageTypes = [];
  tonnageTypeId;
  loadData = true;

  list: InvoicePrintDetail[] = [];

  public view: Observable<GridDataResult>;
  service: GridService;
  trailerId;

  agendaCount = 1;
  branchIds = [];
  dataList;
  public fromDate: Interfaces.PersianDate;
  public toDate: Interfaces.PersianDate;
  selectedType = 3;
  currentDate = moment().locale('fa');
  types = [
    { id: 1, name: 'تسویه شده' },
    { id: 2, name: 'تسویه نشده' },
    { id: 3, name: 'کلی' }
  ];
  isReceived = 1;
  receiveTypes = [
    { id: 1, name: 'رسید شده' },
    { id: 2, name: 'رسید نشده' },
    { id: 3, name: 'کلی' }
  ];
  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    public invoiceService: InvoiceService) {
    this.loadTrailers();
    this.getBranchs();
    this.getTonnageTypes();
    this.getState();
    this.fromDate = new Models.PersianDate(
      +moment(this.currentDate)
        .locale('fa')
        .format('YYYY'),
      +moment(this.currentDate)
        .locale('fa')
        .format('MM') , 1);
    this.toDate = new Models.PersianDate(+moment(this.currentDate)
      .locale('fa')
      .format('YYYY'),
      +moment(this.currentDate)
        .locale('fa')
        .format('MM'), 30);
  }
  counter(flag) {

    if (flag === 'increment') {
      this.agendaCount++;
    }
    if (flag === 'decrement') {
      this.agendaCount--;
    }
    //  this.colony.metMine= this.count;
  }
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
  private loadTrailers() {

    this.trailers$ =
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
      );
  }

  trailerItems() {
    this.setState();
    this.loadData = false;
    let url = '/v1/api/Invoice/trailerId/';
    this.invoiceService.isInvoice = false;
    // const selectedType = this.selectedType = 1 ? 0 : this.selectedType = 2 ? 1 : null;
    // this.invoiceService.loadTrailerItems(this.trailerId.id.toString());
    const headers = new HttpHeaders();

    let params = new HttpParams();
    if (this.branchIds.length > 0) {
      params = params.append('branchIds', this.branchIds.join());
    }
    if (this.trailerId) {
      params = params.append('trailerId', this.trailerId.id.toString());
      url = url + this.trailerId.id;
    } else {
      url = url + '0';
    }
    if (this.tonnageTypeId) {
      params = params.append('tonnageTypeIds', this.tonnageTypeId.join());
    }
    // params = params.append('branchId', this.form.get('branchId').value);
    params = params.append('cleared', this.selectedType.toString()); // بارنامه های تسویه شده نشده یا  همه
    params = params.append('isReceived', this.isReceived.toString()); // بارنامه های رسید شده نشده یا  همه
    params = params.append('fromDate', moment.from(this.fromDate.toString(), 'fa')
      .utc(true).toJSON());
    params = params.append('toDate', moment.from(this.toDate.toString(), 'fa')
      .utc(true).toJSON());
    params = params.append('agendaCount', this.agendaCount.toString());
    // const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers, params }).subscribe(result => {
      this.ClearData();
      this.invoiceService.invoiceAgenda.unshift(...result['trailerAgenda']);
      this.invoiceService.invoiceAgenda = this.invoiceService.invoiceAgenda
        .filter((v, i, a) => a.findIndex(t => (t.agendaId === v.agendaId)) === i);

      this.invoiceService.invoiceAmani.unshift(...result['trailerAmani']);
      this.invoiceService.invoiceAmani = this.invoiceService.invoiceAmani
        .filter((v, i, a) => a.findIndex(t => (t.amaniId === v.amaniId)) === i);

      this.invoiceService.invoiceRecar.unshift(...result['trailerRecar']);
      this.invoiceService.invoiceRecar = this.invoiceService.invoiceRecar
        .filter((v, i, a) => a.findIndex(t => (t.recarId === v.recarId)) === i);

      this.invoiceService.invoiceSubsidy.unshift(...result['trailerSubsidy']);
      this.invoiceService.invoiceSubsidy = this.invoiceService.invoiceSubsidy
        .filter((v, i, a) => a.findIndex(t => (t.subsidyId === v.subsidyId)) === i);

      this.invoiceService.invoiceKaf.unshift(...result['trailerKaf']);
      this.invoiceService.invoiceKaf = this.invoiceService.invoiceKaf
        .filter((v, i, a) => a.findIndex(t => (t.kafId === v.kafId)) === i);

      this.invoiceService.invoicePenalty.unshift(...result['trailerPenalty']);
      this.invoiceService.invoicePenalty = this.invoiceService.invoicePenalty
        .filter((v, i, a) => a.findIndex(t => (t.penaltyId === v.penaltyId)) === i);

      this.invoiceService.invoiceHavale.unshift(...result['trailerHavale']);
      this.invoiceService.sumHavale();
      this.invoiceService.invoiceHavale = this.invoiceService.invoiceHavale
        .filter((v, i, a) => a.findIndex(t => (t.havaleId === v.havaleId)) === i);

      this.invoiceService.invoiceAccessory.unshift(...result['trailerAccessory']);
      this.invoiceService.invoiceAccessory = this.invoiceService.invoiceAccessory
        .filter((v, i, a) => a.findIndex(t => (t.accessoryId === v.accessoryId)) === i);

      this.invoiceService.invoiceFactor.unshift(...result['trailerFactor']);
      this.invoiceService.invoiceFactor = this.invoiceService.invoiceFactor
        .filter((v, i, a) => a.findIndex(t => (t.factorId === v.factorId)) === i);
      this.invoiceService.sumAll();
      this.loadData = true;
    });
  }
  PrintActivity() {
    this.setState();
    this.PrintActivity21();

    const hdr = {
      InvoiceNumber: '',
      CompanyName: 'شرکت حمل و نقل طاووس ترابر',
      // CarManufacturerName: result['carManufacturerName'],
      // CarManufacturerGroupName: result['carManufacturerGroupName'],
      RegisteghredDate: '',
      FromDate: this.fromDate.year + '/' + this.fromDate.month + '/' + this.fromDate.day,
      ToDate: this.toDate.year + '/' + this.toDate.month + '/' + this.toDate.day,
      Description: '',
      // Code: result['code'],
      // Name: result['name']
    };

    const dataSources = JSON.stringify({
      DetailRows: this.list,
      ReportTitle: hdr
    });
    ReportService.setReportViewModel({
      reportName: 'Activity.mrt',
      options: null,
      dataSources,
      reportTitle: 'صورتحساب  تسویه رانندگان  '
    });

    this.router.navigate(['form/report']);
  }
  PrintActivity21() {
    this.invoiceService.invoiceAgenda.forEach(row => {
      this.list.push({
        Type: 'بارنامه',
        AgendaNumber: 'بارنامه' + row.agendaNumber,
        ExportDate: row.persianExportDate,
        PersianExportDate: row.persianExportDate,
        AgentCode: row.agentCode,
        TargetCity: row.targetCity,
        DriverName: row.driverFullName,
        DriverBankAccountNumber: row.driverBankAccountNumber,
        TrailerPlaque: row.trailerPlaque,
        Fare: row.fare,
        PreFare: row.preFare * -1,
        Reward: row.reward,
        CarCount: row.carCount,
        RemainingFare: row.fare - row.preFare + row.reward + row.milkRun,
        MilkRun: row.milkRun,
        BranchTitle: row.branchTitle,
        PlaqueForSort: row.trailerPlaque.replace('ایران', '-').replace('ع'),
      });
    });
    this.invoiceService.invoiceAmani.forEach(row => {
      this.list.push({
        Type: 'امانی',
        AgendaNumber: 'امانی' + row.bodyNumber,
        ExportDate: row.persianExportDate,
        //  !== null ? moment(row.ExportDate)
        // .locale('fa')
        // .format('YYYY/MM/DD') : '',
        PersianExportDate: row.persianExportDate,
        AgentCode: row.agentCode,
        TargetCity: row.targetCity,
        DriverName: row.driverFullName,
        DriverBankAccountNumber: row.driverBankAccountNumber,
        TrailerPlaque: row.trailerPlaque,
        Fare: row.fare * -1,
        PreFare: 0,
        Reward: 0,
        CarCount: 1,
        RemainingFare: row.fare * -1,
        MilkRun: 0,
        BranchTitle: row.branchTitle,
        PlaqueForSort: row.trailerPlaque.replace('ایران', '-').replace('ع'),
      });
    });
    this.invoiceService.invoiceRecar.forEach(row => {
      this.list.push({
        Type: 'عودتی',
        AgendaNumber: 'عودتی' + row.bodyNumber,
        ExportDate: row.persianExportDate,
        //  !== null ? moment(row.ExportDate)
        // .locale('fa')
        // .format('YYYY/MM/DD') : '',
        PersianExportDate: row.persianExportDate,
        AgentCode: row.sender,
        TargetCity: row.targetCity,
        DriverName: row.driverFullName,
        DriverBankAccountNumber: row.driverBankAccountNumber,
        TrailerPlaque: row.trailerPlaque,
        Fare: row.fare,
        PreFare: 0,
        Reward: 0,
        CarCount: 1,
        RemainingFare: row.fare,
        MilkRun: 0,
        BranchTitle: row.branchTitle,
        PlaqueForSort: row.trailerPlaque.replace('ایران', '-').replace('ع'),
      });
    });
    this.invoiceService.invoiceSubsidy.forEach(row => {
      this.list.push({
        Type: 'علی الحساب',
        AgendaNumber: 'علی الحساب',
        ExportDate: row.persianIssueDate,
        //  !== null ? moment(row.ExportDate)
        // .locale('fa')
        // .format('YYYY/MM/DD') : '',
        PersianExportDate: row.persianIssueDate,
        AgentCode: '',
        TargetCity: '',
        DriverName: row.driverFullName,
        DriverBankAccountNumber: row.driverBankAccountNumber,
        TrailerPlaque: row.trailerPlaque,
        Fare: row.amount * -1,
        PreFare: 0,
        Reward: 0,
        CarCount: 1,
        RemainingFare: row.amount * -1,
        MilkRun: 0,
        BranchTitle: row.branchTitle,
        PlaqueForSort: row.trailerPlaque.replace('ایران', '-').replace('ع'),
      });
    });
    this.invoiceService.invoicePenalty.forEach(row => {
      this.list.push({
        Type: 'جرایم',
        AgendaNumber: 'جرایم',
        ExportDate: row.persianIssueDate,
        PersianExportDate: row.persianIssueDate,
        AgentCode: '',
        TargetCity: '',
        DriverName: row.driverFullName,
        DriverBankAccountNumber: row.driverBankAccountNumber,
        TrailerPlaque: row.trailerPlaque,
        Fare: row.amount * -1,
        PreFare: 0,
        Reward: 0,
        CarCount: 1,
        RemainingFare: row.amount * -1,
        MilkRun: 0,
        BranchTitle: row.branchTitle,
        PlaqueForSort: row.trailerPlaque.replace('ایران', '-').replace('ع'),
      });
    });
    this.invoiceService.invoiceKaf.forEach(row => {
      this.list.push({
        Type: 'اجاره کف',
        AgendaNumber: 'اجاره کف',
        ExportDate: row.forMonth,
        PersianExportDate: '',
        AgentCode: '',
        TargetCity: '',
        DriverName: row.driverFullName,
        DriverBankAccountNumber: row.driverBankAccountNumber,
        TrailerPlaque: row.trailerPlaque,
        Fare: row.rent * -1,
        PreFare: 0,
        Reward: 0,
        CarCount: 1,
        RemainingFare: row.rent * -1,
        MilkRun: 0,
        BranchTitle: row.branchTitle,
        PlaqueForSort: row.trailerPlaque.replace('ایران', '-').replace('ع'),
      });
    });
    this.invoiceService.invoiceHavale.forEach(row => {
      this.list.push({
        Type: 'حواله',
        AgendaNumber: 'حواله',
        ExportDate: row.persianIssueDate,
        PersianExportDate: row.persianIssueDate,
        AgentCode: '',
        TargetCity: '',
        DriverName: row.driverFullName,
        DriverBankAccountNumber: row.driverBankAccountNumber,
        TrailerPlaque: row.trailerPlaque,
        Fare: row.amount,
        PreFare: 0,
        Reward: 0,
        CarCount: 1,
        RemainingFare: row.amount,
        MilkRun: 0,
        BranchTitle: row.branchTitle,
        PlaqueForSort: row.trailerPlaque.replace('ایران', '-').replace('ع'),
      });
    });
    this.invoiceService.invoiceAccessory.forEach(row => {
      this.list.push({
        Type: 'لوازم متفرقه',
        AgendaNumber: 'لوازم متفرقه',
        ExportDate: row.persianIssueDate,
        PersianExportDate: row.persianIssueDate,
        AgentCode: '',
        TargetCity: '',
        DriverName: row.driverFullName,
        DriverBankAccountNumber: row.driverBankAccountNumber,
        TrailerPlaque: row.trailerPlaque,
        Fare: row.amount * -1,
        PreFare: 0,
        Reward: 0,
        CarCount: 1,
        RemainingFare: row.amount * -1,
        MilkRun: 0,
        BranchTitle: row.branchTitle,
        PlaqueForSort: row.trailerPlaque.replace('ایران', '-').replace('ع'),
      });
    });
    this.invoiceService.invoiceFactor.forEach(row => {
      this.list.push({
        Type: 'فاکتور',
        AgendaNumber: 'فاکتور',
        ExportDate: row.persianIssueDate,
        PersianExportDate: row.persianIssueDate,
        AgentCode: '',
        TargetCity: '',
        DriverName: row.driverFullName,
        DriverBankAccountNumber: row.driverBankAccountNumber,
        TrailerPlaque: row.trailerPlaque,
        Fare: row.amount,
        PreFare: 0,
        Reward: 0,
        CarCount: 1,
        RemainingFare: row.amount,
        MilkRun: 0,
        BranchTitle: row.branchTitle,
        PlaqueForSort: row.trailerPlaque.replace('ایران', '-').replace('ع'),
      });
    });
    this.invoiceService.invoiceReplace.forEach(row => {
      this.list.push({
        Type: 'جایگزینی',
        AgendaNumber: 'جایگزینی',
        ExportDate: row.persianIssueDate,
        PersianExportDate: row.persianIssueDate,
        AgentCode: '',
        TargetCity: '',
        DriverName: row.driverFullName,
        DriverBankAccountNumber: row.driverBankAccountNumber,
        TrailerPlaque: row.trailerPlaque,
        Fare: row.amount,
        PreFare: 0,
        Reward: 0,
        CarCount: 1,
        RemainingFare: row.amount,
        MilkRun: 0,
        BranchTitle: row.branchTitle,
        PlaqueForSort: row.trailerPlaque.replace('ایران', '-').replace('ع'),
      });
    });
  }
  onDriverAct() {
    const headers = new HttpHeaders();
    const url = '/v1/api/Invoice/driverActivity/';
    let params = new HttpParams();
    if (this.trailerId) {
      params = params.append('trailerId', this.trailerId.id.toString());
    }
    params = params.append('fromDate', moment.from(this.fromDate.toString(), 'fa')
      .utc(true).toJSON());
    params = params.append('toDate', moment.from(this.toDate.toString(), 'fa')
      .utc(true).toJSON());
    this.view = this.http.get(url, { headers, params }).pipe(
      map(
        response => {
          this.dataList = response['entityLinkModels'].map(m => m.entity);
          return <GridDataResult>{
            data: response['entityLinkModels'],
            total: parseInt(response['totalCount'], 10)
          };
        }
      ));
  }
  onListReport() {

    const hdr = {
      fromDate: this.fromDate.toString(),
      toDate: this.toDate.toString()
    };
    this.dataList = this.invoiceService.invoiceAgenda;
    const dataSources = JSON.stringify({
      DetailRows: this.dataList,
      ReportTitle: hdr
    });
    ReportService.setReportViewModel({
      reportName: 'Invoice.mrt',
      options: null,
      dataSources,
      reportTitle: 'صورتحساب مالی رانندگان '
    });

    this.router.navigate(['form/report']);
  }
  onCreate(): void {
    throw new Error('Method not implemented.');
  }
  onEdit(trailerId: number): void {
    // const dialogRef = this.dialog.open(TrailerActivityDialog, {
    //   width: '1100px',
    //   height: '700px',
    //   disableClose: true,
    //   data: {

    //     trailerId: trailerId,
    //     dialogTitle: ''
    //   }
    // });
    // dialogRef.afterClosed().subscribe(result1 => {
    //   if (result1 && result1.state === 'successful') {
    //     // this.fillGrid();
    //   }
    // });

  }
  tafsiliReport() {
    // this.groupbyAgenda();
    // this.groupbyAmani();
    // this.groupbyRecur();
    // this.groupbySubsidy();
    // this.groupbyKaf();
    // this.groupbyPenalty();
    // this.groupbyHavale();
    // this.groupbyAccessory();
    // this.groupbyFactor();
    // this.groupbyReplace();
    // console.log('--------------------------');
    var data: TrailerTafsili[] = [... this.groupbyAgenda(),
    ...this.groupbyAmani(),
    ...this.groupbyRecur(),
    ...this.groupbySubsidy(),
    ...this.groupbyKaf(),
    ...this.groupbyPenalty(),
    ...this.groupbyHavale(),
    ...this.groupbyAccessory(),
    ...this.groupbyFactor(),
    ...this.groupbyReplace()
    ];
    console.log(data);
    /////////////////////
    const detailRows = [];
    data.forEach(row => {
      detailRows.push({
        AgendaNumber: row.agendaNumber,
        TafsiliAccount: row.tafsili,
        TotalAccount: row.totalAccount,
        MoeenAccount: row.moeenAccount,
        Markaz: row.markaz,
        Project: row.project,
        BranchTitle: row.branchTitle,
        Plaque: row.plaque,
        RemainingFare: row.remainingFare

      });
    });
    const hdr = {
      BranchName: '',
      CompanyName: '',
      FromDate: this.fromDate.toString(),
      ToDate: this.toDate.toString(),
      Description: '',
      PreFareTitle: 'بدهکار',
      ReportTitle: ''
    };
    const dataSources = JSON.stringify({
      Mali: detailRows,
      ReportTitle: hdr
    });
    ReportService.setReportViewModel({
      reportName: 'TafsiliTrailer1.mrt',
      options: null,
      dataSources,
      reportTitle: 'گزارش پیشکرایه '
    });

    this.router.navigate(['form/report']);
  }
  groupbyAgenda(): TrailerTafsili[] {
    var result = [];
    this.invoiceService.invoiceAgenda.reduce(function (res, value) {
      if (!res[value.trailerPlaque + value.branchTitle]) {
        res[value.trailerPlaque + value.branchTitle] = {
          plaque: value.trailerPlaque,
          remainingFare: 0,
          agendaNumber: '',
          tafsili: value.trailerTafsili,
          totalAccount: value.totalAccount,
          moeenAccount: value.moeenAccount,
          markaz: value.markaz,
          project: value.project,
          branchTitle: value.branchTitle.replace('شعبه', '')

        };
        result.push(res[value.trailerPlaque + value.branchTitle])
      }
      res[value.trailerPlaque + value.branchTitle].remainingFare += value.remainingFare;
      res[value.trailerPlaque + value.branchTitle].agendaNumber += value.agendaNumber + ',';
      return res;
    }, {});

    // console.log(result)
    return result;

  }
  groupbyAmani(): TrailerTafsili[] {
    var result = [];
    this.invoiceService.invoiceAmani.reduce(function (res, value) {
      if (!res[value.trailerPlaque]) {
        res[value.trailerPlaque] = {
          plaque: value.trailerPlaque,
          remainingFare: 0,
          agendaNumber: ' امانی ',
          tafsili: value.trailerTafsili,
          totalAccount: value.totalAccount,
          moeenAccount: value.moeenAccount,
          markaz: value.markaz,
          project: value.project,
          branchTitle: value.branchTitle.replace('شعبه', '')
        };
        result.push(res[value.trailerPlaque])
      }
      res[value.trailerPlaque].remainingFare -= value.fare;
      res[value.trailerPlaque].agendaNumber += value.bodyNumber + ',';
      return res;
    }, {});

    console.log(result)
    return result;
  }
  groupbyRecur(): TrailerTafsili[] {
    var result = [];
    this.invoiceService.invoiceRecar.reduce(function (res, value) {
      if (!res[value.trailerPlaque]) {
        res[value.trailerPlaque] = {
          plaque: value.trailerPlaque,
          remainingFare: 0,
          agendaNumber: ' عودتی ',
          tafsili: value.trailerTafsili,
          totalAccount: value.totalAccount,
          moeenAccount: value.moeenAccount,
          markaz: value.markaz,
          project: value.project,
          branchTitle: value.branchTitle.replace('شعبه', '')
        };
        result.push(res[value.trailerPlaque])
      }
      res[value.trailerPlaque].remainingFare += value.fare;
      res[value.trailerPlaque].agendaNumber += value.bodyNumber + ',';
      return res;
    }, {});

    // console.log(result)
    return result;
  }
  groupbySubsidy(): TrailerTafsili[] {
    var result = [];
    this.invoiceService.invoiceSubsidy.reduce(function (res, value) {
      if (!res[value.trailerPlaque]) {
        res[value.trailerPlaque] = { plaque: value.trailerPlaque, remainingFare: 0, agendaNumber: 'علی الحساب' };
        result.push(res[value.trailerPlaque])
      }
      res[value.trailerPlaque].remainingFare -= value.amount;
      return res;
    }, {});

    // console.log(result)
    return result;
  }
  groupbyPenalty(): TrailerTafsili[] {
    var result = [];
    this.invoiceService.invoicePenalty.reduce(function (res, value) {
      if (!res[value.trailerPlaque]) {
        res[value.trailerPlaque] = { plaque: value.trailerPlaque, remainingFare: 0, agendaNumber: 'جرایم' };
        result.push(res[value.trailerPlaque])
      }
      res[value.trailerPlaque].remainingFare -= value.amount;
      return res;
    }, {});

    // console.log(result)
    return result;
  }
  groupbyKaf(): TrailerTafsili[] {
    var result = [];
    this.invoiceService.invoiceKaf.reduce(function (res, value) {
      if (!res[value.trailerPlaque]) {
        res[value.trailerPlaque] = { plaque: value.trailerPlaque, remainingFare: 0, agendaNumber: ' اجاره ' };
        result.push(res[value.trailerPlaque])
      }
      res[value.trailerPlaque].remainingFare -= value.rent;
      res[value.trailerPlaque].agendaNumber += value.forMonth;
      return res;
    }, {});

    // console.log(result)
    return result;
  }
  groupbyHavale(): TrailerTafsili[] {
    var result = [];
    this.invoiceService.invoiceHavale.reduce(function (res, value) {
      if (!res[value.trailerPlaque]) {
        res[value.trailerPlaque] = { plaque: value.trailerPlaque, remainingFare: 0, agendaNumber: 'حواله ' };
        result.push(res[value.trailerPlaque])
      }
      res[value.trailerPlaque].remainingFare += value.amount;
      // res[value.trailerPlaque].agendaNumber = 'حواله ';
      return res;
    }, {});

    // console.log(result)
    return result;
  }
  groupbyAccessory(): TrailerTafsili[] {
    var result = [];
    this.invoiceService.invoiceAccessory.reduce(function (res, value) {
      if (!res[value.trailerPlaque]) {
        res[value.trailerPlaque] = { plaque: value.trailerPlaque, remainingFare: 0, agendaNumber: 'لوازم متفرقه' };
        result.push(res[value.trailerPlaque])
      }
      res[value.trailerPlaque].remainingFare -= value.amount;
      // res[value.trailerPlaque].agendaNumber = 'لوازم متفرقه';
      return res;
    }, {});

    // console.log(result)
    return result;
  }
  groupbyFactor(): TrailerTafsili[] {
    var result = [];
    this.invoiceService.invoiceFactor.reduce(function (res, value) {
      if (!res[value.trailerPlaque]) {
        res[value.trailerPlaque] = { plaque: value.trailerPlaque, remainingFare: 0, agendaNumber: 'فاکتور ' };
        result.push(res[value.trailerPlaque])
      }
      res[value.trailerPlaque].remainingFare += value.amount;
      // res[value.trailerPlaque].agendaNumber = 'فاکتور ';
      return res;
    }, {});

    // console.log(result)
    return result;
  }
  groupbyReplace(): TrailerTafsili[] {
    var result = [];
    this.invoiceService.invoiceReplace.reduce(function (res, value) {
      if (!res[value.trailerPlaque]) {
        res[value.trailerPlaque] = { plaque: value.trailerPlaque, remainingFare: 0, agendaNumber: 'جایگزینی' };
        result.push(res[value.trailerPlaque])
      }
      res[value.trailerPlaque].remainingFare += value.amount;
      // res[value.trailerPlaque].agendaNumber = 'جایگزینی';
      return res;
    }, {});

    // console.log(result)
    return result;
  }
  getUrl(): string {
    throw new Error('Method not implemented.');
  }
  onClose(): void {
  }
  ClearData() {
    this.loadData = false;
    this.invoiceService.invoiceAgenda = [];
    this.invoiceService.invoiceAmani = [];
    this.invoiceService.invoiceRecar = [];
    this.invoiceService.invoiceSubsidy = [];
    this.invoiceService.invoiceHavale = [];
    this.invoiceService.invoicePenalty = [];
    this.invoiceService.invoiceChaque = [];
    this.invoiceService.invoiceKaf = [];
    this.invoiceService.invoiceAccessory = [];
    this.invoiceService.invoiceFactor = [];
    this.loadData = true;
  }
  onPrint() {
    const detailRows = [];
    const details = this.invoiceService.invoiceAgenda;
    details.forEach(row => {
      detailRows.push({
        AgendaNumber: row.agendaNumber,
        ExportDate: row.exportDate !== null ? moment(row.exportDate)
          .locale('fa')
          .format('YYYY/MM/DD') : '',
        AgentCode: row.agentCode,
        TargetCity: row.targetCity,
        DriverName: row.driverFullName,
        DriverBankAccountNumber: row.driverBankAccountNumber,
        TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
        Fare: row.fare,
        PreFare: row.preFare,
        Reward: row.reward,
        CarCount: row.carCount,
        RemainingFare: row.remainingFare,
        BranchTitle: row.branchTitle,
        Type: row.type
      });
    });

  }
  setState(): void {
    let config: trailerActivityFormState;
    config = {
      agendaCount: this.agendaCount,
      branchIds: this.branchIds,
      agendaType: this.selectedType,
      fromDate: this.fromDate,
      toDate: this.toDate,
      receiveTypes: this.isReceived,
      tonnageTypeId: this.tonnageTypeId,
      trailerId: this.trailerId

    }
    localStorage.setItem('trailerActivityFormState', JSON.stringify(config));
    // localStorage.setItem(token+'column', JSON.stringify(visibleCol));
  }
  getState() {
    const settings = localStorage.getItem('trailerActivityFormState');
    let config = settings ? JSON.parse(settings) : settings;
    if(config){
    this.agendaCount = config.agendaCount;
    this.branchIds = config.branchIds;
    this.selectedType = config.agendaType;
    this.fromDate = config.fromDate;
    this.toDate = config.toDate;
    this.isReceived = config.receiveTypes;
    this.tonnageTypeId = config.tonnageTypeId;
    this.trailerId = config.trailerId;
    }
  }
  ngOnDestroy(): void {
    // this.ClearData();
  }
}

