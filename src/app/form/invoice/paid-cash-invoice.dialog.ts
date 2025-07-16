import { Component, Inject, HostListener, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import * as moment from 'jalali-moment';
import { Router } from '@angular/router';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { InvoiceService } from './invoice.service'; import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { InvoiceSearchDialogComponent } from './search-dialog.component';
import { ChaqueDialog } from '../chaque/chaque.dialog';
import { ChaqueDetailDto } from '../chaque/dtos/chaqueDetailDto';
import { InvoiceChaqueComponent } from './invoice-chaque.component';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
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
const createFormGroup = item => new FormGroup({
  'partId': new FormControl(item.partId, Validators.required),
  'partName': new FormControl(item.partName),
  'packagingId': new FormControl(item.packagingId, Validators.required),
  'loadingLocationId': new FormControl(item.loadingLocationId, Validators.required),
  'amount': new FormControl(item.amount, Validators.required)
});

const objectsEqual = (o1, o2) =>
  Object.keys(o1).length === Object.keys(o2).length
  && Object.keys(o1).every(p => o1[p] === o2[p]);

const arraysEqual = (a1, a2) =>
  a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]));

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'paid-cash-invoice-dialog',
  templateUrl: 'paid-cash-invoice.dialog.html',

})
// tslint:disable-next-line: component-class-suffix
export class PaidCashInvoiceDialog extends ModalBaseClass implements OnInit, OnDestroy {
  payTypesLoading = false;
  payTypes = [];
  payTypesInput$ = new Subject<string>();
  selectedPayType = '';
  @ViewChild('invoiceDatePicker') invoiceDatePicker;
  constructor(
    public dialogRef: MatDialogRef<PaidCashInvoiceDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private router: Router,
    public dialog: MatDialog,
    private elementRef: ElementRef,
    private fb: FormBuilder,
    public invoiceService: InvoiceService,
    public authService: AuthService
  ) {
    super();
    this.getPayTypes();
  }

  ngOnInit() {
    this.formBuilder();
    if (!this.data.isNew) {
      this.data.isTrailerCheckout ? this.invoiceService.loadTrailerItems(this.data.trailerId) :
        this.invoiceService.loadInvoiceItems(this.data.invoice.id);
      this.invoiceService.allIds = this.data.invoice.ids;
      // this.invoiceService.idsOnEnter = this.data.invoice.ids;
    }
  }
  onEditChaque(): void {
    const dialogRef = this.dialog.open(InvoiceChaqueComponent, {
      width: '1100px',
      height: '450px',
      disableClose: true,
      data: {
        InvoiceId: this.data.invoice.id,
        dialogTitle: 'لیست چک های صورتحساب',
        isEdit: true
      }
    });
    dialogRef.afterClosed().subscribe(result2 => {
      if (result2 && result2.state === 'successful') {
        // this.fillGrid();
      }
    });
    // });
  }
  formBuilder() {
    this.form = this.fb.group(
      {
        invoiceNumber: [this.data.invoice.invoiceNumber, [Validators.required], this.uniqueCode.bind(this)],
        registeredDate: [this.data.invoice.registeredDate, Validators.required],
        payTypeId: this.data.invoice.payTypeId,
        description: this.data.invoice.description
      },
      { updateOn: 'blur' }
    );
  }
  // isNewAddedList() {

  // }
  onShowSearchDialog() {
    const title = ' جستجوی پیشرفته';
    const dialogRef = this.dialog.open(InvoiceSearchDialogComponent, {
      disableClose: true,
      width: '700px',
      height: '650px',
      data: {
        // invoice: new InvoiceDto(data),
        dialogTitle: title,
        // isEdit: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // if (result && result.state === 'successful') {
      // this.fillGrid();
      // }
    });
  }
  get code() {
    return this.form.get('invoiceNumber');
  }
  uniqueCode(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    if (ctrl.value === this.data.invoice.invoiceNumber) { return of(null); }
    // const equalOriginal = ctrl.value === this.data.InvoiceNumber;
    return this.http.get(this.getUrl() + 'invoiceNumber/' + ctrl.value).pipe(
      map(codes => {
        return codes ? { uniqueCode: true } : null;
      })
    );
  }
  getPayTypes(): void {
    this.http
      .get('/v1/api/Lookup/payTypes')
      .subscribe((result: ILookupResultDto[]) => (this.payTypes = result));
  }
  onChangePayType(event) {
    this.selectedPayType = event.title;
  }
  onClose(): void {
    // if (this.formGroup != null && !this.formGroup.dirty) {
    this.dialogRef.close({ data: null, state: 'cancel' });
    if (!this.data.isEdit) {
      this.onEditChaque();
    }
  }
  onSave(): void {
    // if (this.form.valid) {
    //   const confirmDialogRef = this.dialog.open(ConfirmDialog, {
    //     width: '250px',
    //     data: { state: 'ok' }
    //   });

    //   confirmDialogRef.afterClosed().subscribe(result => {
    //     if (result.state == 'confirmed') {
    //       this.dialogRef.close({ data: null, state: 'cancel' });
    //     }
    //   });
    // }
    // if (this.form.dirty && this.form.valid || this.invoiceService.ifFormChanged()) {
    if (this.form.valid) {
      if (this.data.isEdit === true) {
        this.edit();
      } else {
        this.create();
        this.data.isEdit = true;
      }
      // this.onClose();
      // this.invoiceService.idsOnEnter = this.invoiceService.allIds;
    }
  }

  create() {
    this.invoiceService.sumAll();
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .post(
        this.getUrl(),
        JSON.stringify({
          InvoiceNumber: this.form.get('invoiceNumber').value,
          RegisteredDate: moment.from(this.form.get('registeredDate').value, 'fa').format('YYYY/MM/DD'),
          Ids: this.invoiceService.allIds,
          PayTypeId: this.form.get('payTypeId').value,
          SumAgenda: this.invoiceService.sumAgendaFare,
          SumAmani: this.invoiceService.sumAmaniFare,
          SumRecar: this.invoiceService.sumRecarFare,
          SumSubsidy: this.invoiceService.sumSubsidyAmount,
          SumPenalty: this.invoiceService.sumPenaltyAmount,
          SumKaf: this.invoiceService.sumKafRent,
          SumHavale: this.invoiceService.sumHavaleAmount,
          SumAccessory: this.invoiceService.sumAccessoryAmount,
          SumFactor: this.invoiceService.sumFactorAmount,
          SumSofte: this.invoiceService.sumSofteAmount,
          SumReplace: this.invoiceService.sumReplaceAmount,
          total: this.invoiceService.total,
          Description: this.form.get('description').value,
          // Chaques: this.invoiceService.invoiceChaque
        }),
        { headers: headers1 }
      )
      .subscribe(
        result => {
          this.data.invoice.id = result['entity'].id;
          if (this.selectedPayType.includes('چک')) {
            this.onEditChaque();
            this.dialogRef.close({ data: null, state: 'cancel' });
          }
        },
        (error: any) => {
          console.log('create ');
          console.log(error);
        }
      );
    this.dialogRef.close();
  }

  edit() {
    this.invoiceService.sumAll();
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .put(
        this.getUrl() + this.data.invoice.id,
        JSON.stringify({
          InvoiceNumber: this.form.get('invoiceNumber').value,
          RegisteredDate: moment.from(this.form.get('registeredDate').value, 'en')
            .utc(true).toJSON(),
          // moment.from(this.form.get('registeredDate').value, 'fa').format('YYYY/MM/DD'),
          Ids: this.invoiceService.allIds,
          PayTypeId: this.form.get('payTypeId').value,
          SumAgenda: this.invoiceService.sumAgendaFare,
          SumAmani: this.invoiceService.sumAmaniFare,
          SumRecar: this.invoiceService.sumRecarFare,
          SumSubsidy: this.invoiceService.sumSubsidyAmount,
          SumHavale: this.invoiceService.sumHavaleAmount,
          SumPenalty: this.invoiceService.sumPenaltyAmount,
          SumKaf: this.invoiceService.sumKafRent,
          SumAccessory: this.invoiceService.sumAccessoryAmount,
          SumFactor: this.invoiceService.sumFactorAmount,
          SumSofte: this.invoiceService.sumSofteAmount,
          SumReplace: this.invoiceService.sumReplaceAmount,
          total: this.invoiceService.total,
          Description: this.form.get('description').value
        }),
        { headers: headers1 }
      )
      .subscribe(
        result => {
                  this.dialogRef.close({ data: null, state: 'cancel' });
          // console.log('OK');

          // this.form.reset();

        },
        (error: any) => {
          console.log(error);
        }
      );
  }

  onInvoicePrint(): void {
    if (!this.data.isEdit) {
      // return;
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '250px',
        height: '150px',
        data: { state: 'ok', messageText: 'ابتدا صورتحساب را ذخیره کنید ، مایلید ذخیره شود؟' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.state === 'confirmed') {
          this.onSave();
          this.invoiceService.printPreviewInvoice(this.data.invoice.id);
          dialogRef.close({ data: null, state: 'cancel' });
          this.dialogRef.close({ state: 'successful' });
        }
      });
    } else {
      this.invoiceService.printPreviewInvoice(this.data.invoice.id);
      this.dialogRef.close({ state: 'successful' });
    }

  }
  popUpCalendar1() {
    this.invoiceDatePicker.open();
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
      FromDate: "",// this.fromDate.toString(),
      ToDate: "",//this.toDate.toString(),
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
    this.onClose();
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
        res[value.trailerPlaque] = { plaque: value.trailerPlaque, remainingFare: 0, tafsili: value.trailerTafsili, agendaNumber: 'جرایم' };
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
        res[value.trailerPlaque] = { plaque: value.trailerPlaque, remainingFare: 0, tafsili: value.trailerTafsili, agendaNumber: 'حواله ' };
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
        res[value.trailerPlaque] = { plaque: value.trailerPlaque, remainingFare: 0, tafsili: value.trailerTafsili, agendaNumber: 'لوازم متفرقه' };
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
        res[value.trailerPlaque] = { plaque: value.trailerPlaque, remainingFare: 0, tafsili: value.trailerTafsili, agendaNumber: 'فاکتور ' };
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
        res[value.trailerPlaque] = { plaque: value.trailerPlaque, remainingFare: 0, tafsili: value.trailerTafsili, agendaNumber: 'جایگزینی' };
        result.push(res[value.trailerPlaque])
      }
      res[value.trailerPlaque].remainingFare += value.amount;
      // res[value.trailerPlaque].agendaNumber = 'جایگزینی';
      return res;
    }, {});

    // console.log(result)
    return result;
  }

  getUrl() {
    return '/v1/api/Invoice/';
  }

  ngOnDestroy(): void {
    this.invoiceService.invoiceAgenda = [];
    this.invoiceService.invoiceAmani = [];
    this.invoiceService.invoiceRecar = [];
    this.invoiceService.invoiceSubsidy = [];
    this.invoiceService.invoiceReplace = [];
    this.invoiceService.invoiceHavale = [];
    this.invoiceService.invoicePenalty = [];
    this.invoiceService.invoiceChaque = [];
    this.invoiceService.invoiceKaf = [];
    this.invoiceService.invoiceAccessory = [];
    this.invoiceService.invoiceFactor = [];
    this.invoiceService.invoiceSofte = [];
  }
}
