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
  selector: 'invoice-replace-component',
  templateUrl: 'invoice-replace.component.html'
})

export class InvoiceReplaceComponent implements OnInit {
  @ViewChild('invoiceDatePicker') invoiceDatePicker;

  // @Input() public invoiceReplace: any[] = [];
  selectedId: number;
  replacesLoading = false;
  replaces$: Observable<Object | any[]>;
  replacesInput$ = new Subject<string>();

  constructor(
    public intl: IntlService,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    public invoiceService: InvoiceService
  ) {
  }
  ngOnInit() {
    // this.replaceIds = this.Ids;
    // this.getReplaceList(this.replaceIds);
    this.loadReplaces();
    // this.sendIds();
  }
  private loadReplaces() {
    this.replaces$ =
      this.replacesInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.replacesLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/replaceTrailer/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.replacesLoading = false))
          )
        )
      );
  }

  addReplace(id: number) {
    // const url = '/v1/api/Invoice/InvoiceItems/' + ids;
    const url = '/v1/api/ReplaceTrailer/' + id;
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
          replaceId: item.id,
          // bodyNumber: item.bodyNumber,
          persianIssueDate: item.persianIssueDate, // moment(item.exportDate).locale('fa').format('YYYY/M/D'),
          amount: item.amount, // .toLocaleString(undefined, {maximumFractionDigits: 0}),
          driverFullName: item.driverName,
          trailerPlaque: item.trailerPlaque,
          branchTitle: item.branchName
        };
        this.invoiceService.invoiceReplace.unshift(add);
        this.snackBar.open(
          'با موفقیت به لیست اضافه شد.',
          '',
          {
            duration: 3000,
            panelClass: ['snack-bar-sucsess']
          }
        );
        // this.sendIds();
        this.invoiceService.sumReplace();
      }
    });
  }
  add2List() {
    if (!this.invoiceService.invoiceReplace.find(a => a.replaceId === this.selectedId)) {
      this.addReplace(this.selectedId);
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
    const index = this.invoiceService.invoiceReplace.findIndex(({ replaceId }) => replaceId === id);
    this.invoiceService.invoiceReplace.splice(index, 1);
    this.snackBar.open(
      'با موفقیت از لیست حذف شد.',
      '',
      {
        duration: 3000,
        panelClass: ['snack-bar-info']
      }
    );
    // this.sendIds();
    this.invoiceService.sumReplace();
  }

  getUrl() {
    return '/v1/api/Invoice/';
  }

}
