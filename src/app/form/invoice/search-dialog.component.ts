import { Component, Inject, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormBuilder, Validators } from '@angular/forms';
import * as moment from 'jalali-moment';
import { concat, Observable, of, Subject, merge } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { InvoiceService } from './invoice.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'search-dialog',
  templateUrl: 'search-dialog.component.html'
})

export class InvoiceSearchDialogComponent extends ModalBaseClass implements OnInit {
  branchs = [];
  @ViewChild('picker') picker;
  @ViewChild('picker1') picker1;

  branchIds = [];
  tonnageTypes = [];
  tonnageTypeIds = [];
  // agendaCount=1;

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  constructor(public dialogRef: MatDialogRef<InvoiceSearchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private invoiceService: InvoiceService,
    private fb: FormBuilder) {
    super();
    this.loadTrailers();
    this.getBranchs();
    this.getTonnageTypes();
  }

  ngOnInit() {
    this.CreateForm();
  }
  CreateForm() {
    this.form = this.fb.group({
      trailerId: '',
      tonnageTypeIds: [],
      branchIds: [],
      agendaType: '1',
      payType: '1',
      cleared: '1',
      billed: '1',
      fromDate: [],
      toDate: [],
      agendaCount: 1,
      fromPlate2: '',
      toPlate2: ''
    });
  }
  popUpCalendar() {
    this.picker.open();
  }
  popUpCalendar1() {
    this.picker1.open();
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
  getTonnageTypes(): void {
    this.http
      .get('/v1/api/Lookup/tonnageTypes')
      .subscribe((result: ILookupResultDto[]) => (this.tonnageTypes = result));
  }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }
  counter(flag) {

    if (flag === 'increment') {
      this.form.get('agendaCount').setValue(this.form.get('agendaCount').value + 1);
    }
    if (flag === 'decrement') {
      this.form.get('agendaCount').setValue(this.form.get('agendaCount').value - 1);
    }
    //  this.colony.metMine= this.count;
  }
  validateInput(event: any) {
    const input = event.target.value;
    if (!/^\d{0,3}$/.test(input)) {
      event.target.value = input.slice(0, -1);
    }
  }
  onSave() {
    if (this.form.valid) {
      const headers = new HttpHeaders();

      let params = new HttpParams();

      if (this.form.get('branchIds').value?.length > 0) {
        params = params.append('branchIds', this.form.get('branchIds').value.join());
      }
      if (this.form.get('tonnageTypeIds').value?.length > 0) {
        params = params.append('tonnageTypeIds', this.form.get('tonnageTypeIds').value.join());
      }

      params = params.append('advanceSearch', "true");
      params = params.append('trailerId', this.form.get('trailerId').value?.id);
      params = params.append('cleared', this.form.get('cleared').value); // تسویه شده نشده   (2 تسویه نشده)
      params = params.append('billed', this.form.get('billed').value); // بارنامه های صورتحسابشده یا صورتحساب نشده
      params = params.append('agendaType', this.form.get('agendaType').value); // بارنامه های رسیده یا نرسیده یا  همه
      params = params.append('payType', this.form.get('payType').value); // بارنامه های نقدی یا غیرنقدی
      params = params.append('fromPlate2', this.form.get('fromPlate2').value); // سه رقم پلاک از
      params = params.append('toPlate2', this.form.get('toPlate2').value); // سه رقم پلاک تا
      params = params.append('agendaCount', this.form.get('agendaCount').value.toString());
      params = params.append('fromDate', moment.from(this.form.get('fromDate').value, 'en')
        .utc(true).toJSON());
      params = params.append('toDate', moment.from(this.form.get('toDate').value, 'en')
        .utc(true).toJSON());

      let url;
      if(this.form.get('trailerId').value?.id >0){

        url = '/v1/api/Invoice/trailerId/' + this.form.get('trailerId').value.id;
      } else
      url = '/v1/api/Invoice/trailerId/0'

      this.http.get(url, { headers, params }).subscribe(result => {

        this.invoiceService.invoiceAgenda.unshift(...result['trailerAgenda']);
        this.invoiceService.sumAgenda();
        this.invoiceService.invoiceAgenda = this.invoiceService.invoiceAgenda
          //فیلتر و اضافه کردن بارنامه هایی که در لیست نبوده اند
          .filter((v, i, a) => a.findIndex(t => (t.agendaId === v.agendaId)) === i);

        this.invoiceService.invoiceAmani?.unshift(...result['trailerAmani']);
        this.invoiceService.sumAmani();
        this.invoiceService.invoiceAmani = this.invoiceService.invoiceAmani
          .filter((v, i, a) => a.findIndex(t => (t.amaniId === v.amaniId)) === i);

        this.invoiceService.invoiceRecar.unshift(...result['trailerRecar']);
        this.invoiceService.sumRecar();
        this.invoiceService.invoiceRecar = this.invoiceService.invoiceRecar
          .filter((v, i, a) => a.findIndex(t => (t.recarId === v.recarId)) === i);

        this.invoiceService.invoiceSubsidy.unshift(...result['trailerSubsidy']);
        this.invoiceService.sumSubsidy();
        this.invoiceService.invoiceSubsidy = this.invoiceService.invoiceSubsidy
          .filter((v, i, a) => a.findIndex(t => (t.subsidyId === v.subsidyId)) === i);

        this.invoiceService.invoiceReplace.unshift(...result['trailerReplace']);
        this.invoiceService.sumReplace();
        this.invoiceService.invoiceReplace = this.invoiceService.invoiceReplace
          .filter((v, i, a) => a.findIndex(t => (t.replaceId === v.replaceId)) === i);

        this.invoiceService.invoiceKaf.unshift(...result['trailerKaf']);
        this.invoiceService.sumKaf();
        this.invoiceService.invoiceKaf = this.invoiceService.invoiceKaf
          .filter((v, i, a) => a.findIndex(t => (t.kafRentPaidId === v.kafRentPaidId)) === i);

        this.invoiceService.invoicePenalty.unshift(...result['trailerPenalty']);
        this.invoiceService.sumPenalty();
        this.invoiceService.invoicePenalty = this.invoiceService.invoicePenalty
          .filter((v, i, a) => a.findIndex(t => (t.penaltyId === v.penaltyId)) === i);

        this.invoiceService.invoiceHavale.unshift(...result['trailerHavale']);
        this.invoiceService.sumHavale();
        this.invoiceService.invoiceHavale = this.invoiceService.invoiceHavale
          .filter((v, i, a) => a.findIndex(t => (t.havaleId === v.havaleId)) === i);

        this.invoiceService.invoiceAccessory.unshift(...result['trailerAccessory']);
        this.invoiceService.sumAccessory();
        this.invoiceService.invoiceAccessory = this.invoiceService.invoiceAccessory
          .filter((v, i, a) => a.findIndex(t => (t.accessoryId === v.accessoryId)) === i);

        this.invoiceService.invoiceFactor.unshift(...result['trailerFactor']);
        this.invoiceService.sumFactor();
        this.invoiceService.invoiceFactor = this.invoiceService.invoiceFactor
          .filter((v, i, a) => a.findIndex(t => (t.factorId === v.factorId)) === i);

        // this.invoiceService.allIds = this.invoiceService.agendaIds + 'p' + this.invoiceService.amaniIds + 'p' +
        // this.invoiceService.recarIds + 'p' + this.invoiceService.subsidyIds;
        this.dialogRef.close({ data: null, state: 'cancel' });
        // this.invoiceService.isNewAddedList();
        // this.invoiceService.idsOnEnter = this.invoiceService.allIds;
        this.snackBar.open(
          'با موفقیت به لیست اضافه شد.',
          '',
          {
            duration: 3000,
            panelClass: ['snack-bar-sucsess']
          }
        );
      });
    }
  }
  onClose() {
    // if (!this.form.dirty) {
    this.dialogRef.close({ data: null, state: 'cancel' });
    // } else {
    //   const dialogRef = this.dialog.open(ConfirmDialog, {
    //     width: '250px',
    //     data: { state: 'ok' }
    //   });

    //   dialogRef.afterClosed().subscribe(result => {
    //     if (result.state == 'confirmed') {
    //       this.dialogRef.close({ data: null, state: 'cancel' });
    //     }
    //   });
    // }
  }
}

