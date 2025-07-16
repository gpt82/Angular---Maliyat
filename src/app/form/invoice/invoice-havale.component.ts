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
  selector: 'invoice-havale-component',
  templateUrl: 'invoice-havale.component.html'
})

export class InvoiceHavaleComponent implements OnInit {
  @ViewChild('invoiceDatePicker') invoiceDatePicker;

  // @Input() public invoiceHavale: any[] = [];
  selectedId: number;
  havalesLoading = false;
  havales$: Observable<Object | any[]>;
  havalesInput$ = new Subject<string>();

  constructor(
    public intl: IntlService,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    public invoiceService: InvoiceService
  ) {
  }
  ngOnInit() {
    // this.havaleIds = this.Ids;
    // this.getHavaleList(this.havaleIds);
    this.loadHavales();
    // this.sendIds();
  }
  private loadHavales() {
    this.havales$ =
      this.havalesInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.havalesLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/havales/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.havalesLoading = false))
          )
        )
      );
  }

  // sendIds() {
  //   this.invoiceService.invoiceHavaleIds$.next();
  // }
  // addHavale() {
  //   const url = '/v1/api/havale/';
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   this.http.get(url, { headers: headers }).subscribe(result => {
  //     const items = result['entityLinkModels'].map(m => m.entity);
  //     const add = items.map(i => ({
  //       havaleId: i.id,
  //       driverFullName: i.driverName,
  //       trailerPlaque: i.trailerPlaque,
  //       persianIssueDate: i.persianIssueDate,
  //       amount: i.amount.toLocaleString(undefined, {maximumFractionDigits: 0}) // toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  //     }));
  //     // {

  //     //   havaleNumber: item.waybillNumber,
  //     //   persianExportDate: moment(item.exportDate).locale('fa').format('YYYY/M/D'),
  //     //   agentCode: item.receiverTitle,

  //     //   branchTitle: item.branchTitle
  //     // };
  //     this.invoiceHavale.unshift(...add);
  //     this.sendIds();
  //   });
  // }

  addHavale(id: number) {
    // const url = '/v1/api/Invoice/InvoiceItems/' + ids;
    const url = '/v1/api/Havale/' + id;
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
          havaleId: item.id,
          // bodyNumber: item.bodyNumber,
          persianIssueDate: item.persianIssueDate, // moment(item.exportDate).locale('fa').format('YYYY/M/D'),
          amount: item.amount, // .toLocaleString(undefined, {maximumFractionDigits: 0}),
          driverFullName: item.driverName,
          trailerPlaque: item.trailerPlaque,
          branchTitle: item.branchName
        };
        this.invoiceService.invoiceHavale.unshift(add);
        this.snackBar.open(
          'با موفقیت به لیست اضافه شد.',
          '',
          {
            duration: 3000,
            panelClass: ['snack-bar-sucsess']
          }
        );
        // this.sendIds();
        this.invoiceService.sumHavale();
      }
    });
  }
  add2List() {
    if (!this.invoiceService.invoiceHavale.find(a => a.havaleId === this.selectedId)) {
      this.addHavale(this.selectedId);
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
    const index = this.invoiceService.invoiceHavale.findIndex(({ havaleId }) => havaleId === id);
    this.invoiceService.invoiceHavale.splice(index, 1);
    this.snackBar.open(
      'با موفقیت از لیست حذف شد.',
      '',
      {
        duration: 3000,
        panelClass: ['snack-bar-info']
      }
    );
    // this.sendIds();
    this.invoiceService.sumHavale();
  }

  getUrl() {
    return '/v1/api/Invoice/';
  }

}
