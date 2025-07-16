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
  selector: 'invoice-penalty-component',
  templateUrl: 'invoice-penalty.component.html'
})

export class InvoicePenaltyComponent implements OnInit {
  @ViewChild('invoiceDatePicker') invoiceDatePicker;

  // @Input() public invoicePenalty: any[] = [];
  selectedId: number;
  penaltysLoading = false;
  penaltys$: Observable<Object | any[]>;
  penaltysInput$ = new Subject<string>();

  constructor(
    public intl: IntlService,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    public invoiceService: InvoiceService
  ) {
  }
  ngOnInit() {
    // this.penaltyIds = this.Ids;
    // this.getPenaltyList(this.penaltyIds);
    this.loadPenaltys();
    // this.sendIds();
  }
  private loadPenaltys() {
    this.penaltys$ =
      this.penaltysInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.penaltysLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/penaltys/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.penaltysLoading = false))
          )
        )
      );
  }

  addPenalty(id: number) {
    // const url = '/v1/api/Invoice/InvoiceItems/' + ids;
    const url = '/v1/api/Penalty/' + id;
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
          penaltyId: item.id,
          // bodyNumber: item.bodyNumber,
          persianIssueDate: item.persianIssueDate, // moment(item.exportDate).locale('fa').format('YYYY/M/D'),
          amount: item.amount, // .toLocaleString(undefined, {maximumFractionDigits: 0}),
          driverFullName: item.driverName,
          trailerPlaque: item.trailerPlaque,
          branchTitle: item.branchName
        };
        this.invoiceService.invoicePenalty.unshift(add);
        this.snackBar.open(
          'با موفقیت به لیست اضافه شد.',
          '',
          {
            duration: 3000,
            panelClass: ['snack-bar-sucsess']
          }
        );
        // this.sendIds();
        this.invoiceService.sumPenalty();
      }
    });
  }
  add2List() {
    if (!this.invoiceService.invoicePenalty.find(a => a.penaltyId === this.selectedId)) {
      this.addPenalty(this.selectedId);
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
    const index = this.invoiceService.invoicePenalty.findIndex(({ penaltyId }) => penaltyId === id);
    this.invoiceService.invoicePenalty.splice(index, 1);
    this.snackBar.open(
      'با موفقیت از لیست حذف شد.',
      '',
      {
        duration: 3000,
        panelClass: ['snack-bar-info']
      }
    );
    // this.sendIds();
    this.invoiceService.sumPenalty();
  }

  getUrl() {
    return '/v1/api/Invoice/';
  }

}
