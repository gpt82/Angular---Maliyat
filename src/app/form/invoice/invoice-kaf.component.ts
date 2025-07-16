import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, catchError, map } from 'rxjs/operators';
import { InvoiceService } from './invoice.service';
import * as moment from 'jalali-moment';
import { IntlService } from '@progress/kendo-angular-intl';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'invoice-kaf-component',
  templateUrl: 'invoice-kaf.component.html'
})

export class InvoiceKafComponent implements OnInit {
  @ViewChild('invoiceDatePicker') invoiceDatePicker;

  // @Input() public invoiceKaf: any[] = [];
  selectedId: number;
  kafsLoading = false;
  kafs$: Observable<Object | any[]>;
  kafsInput$ = new Subject<string>();

  constructor(
    public intl: IntlService,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    public invoiceService: InvoiceService
  ) {
  }
  ngOnInit() {
    // this.kafIds = this.Ids;
    // this.getKafList(this.kafIds);
    this.loadKafs();
    // this.sendIds();
  }
  private loadKafs() {
    this.kafs$ =
      this.kafsInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.kafsLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/kafRentPaids/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.kafsLoading = false))
          )
        )
      );
  }

  addKafRentPaid(id: number) {
    // const url = '/v1/api/Invoice/InvoiceItems/' + ids;
    const url = '/v1/api/KafRentPaid/' + id;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      const item = result['entity'];
      if (item.invoiceId > 0) {
        this.http.get('/v1/api/Invoice/' + item.invoiceId, { headers: headers }).subscribe(res => {
          const ag = res['entity'];
          alert(` در صورتحساب شماره  ${ag.invoiceNumber}   در تاریخ  ${moment(ag.exportDate).locale('fa').format('YYYY/M/D')}  تسویه شد`);
        });
      } else {
        const add = {
          kafRentPaidId: item.id,
          // bodyNumber: item.bodyNumber,
          forMonth: item.forMonth, // moment(item.exportDate).locale('fa').format('YYYY/M/D'),
          rent: item.rent, // .toLocaleString(undefined, {maximumFractionDigits: 0}),
          driverFullName: item.driverFullName,
          trailerPlaque: item.trailerPlaque,
          // branchTitle: item.branchName
        };
        this.invoiceService.invoiceKaf.unshift(add);
        this.snackBar.open(
          'با موفقیت به لیست اضافه شد.',
          '',
          {
            duration: 3000,
            panelClass: ['snack-bar-sucsess']
          }
        );
        // this.sendIds();
        this.invoiceService.sumKaf();
      }
    });
  }
  add2List() {
    if (!this.invoiceService.invoiceKaf.find(a => a.kafId === this.selectedId)) {
      this.addKafRentPaid(this.selectedId);
    } else {
      this.snackBar.open(
        'قبلا در همین صورتحساب وارد کرده اید',
        '',
        {
          duration: 3000,
          panelClass: ['snack-bar-fail']
        }
      );
    }
    this.selectedId = 0;
  }

  public removeHandler(id: number): void {
    const index = this.invoiceService.invoiceKaf.findIndex(({ kafRentPaidId }) => kafRentPaidId === id);
    this.invoiceService.invoiceKaf.splice(index, 1);
    this.snackBar.open(
      'با موفقیت از لیست حذف شد.',
      '',
      {
        duration: 3000,
        panelClass: ['snack-bar-info']
      }
    );
    // this.sendIds();
    this.invoiceService.sumKaf();
  }

  getUrl() {
    return '/v1/api/Invoice/';
  }

}
