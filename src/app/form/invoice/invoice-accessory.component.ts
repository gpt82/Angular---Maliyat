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
  selector: 'invoice-accessory-component',
  templateUrl: 'invoice-accessory.component.html'
})

export class InvoiceAccessoryComponent implements OnInit {
  @ViewChild('invoiceDatePicker') invoiceDatePicker;

  // @Input() public invoiceAccessory: any[] = [];
  selectedId: number;
  accessorysLoading = false;
  accessorys$: Observable<Object | any[]>;
  accessorysInput$ = new Subject<string>();

  constructor(
    public intl: IntlService,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    public invoiceService: InvoiceService
  ) {
  }
  ngOnInit() {
    // this.accessoryIds = this.Ids;
    // this.getAccessoryList(this.accessoryIds);
    this.loadAccessorys();
    // this.sendIds();
  }
  private loadAccessorys() {
    this.accessorys$ =
      this.accessorysInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.accessorysLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/driverAccessory/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.accessorysLoading = false))
          )
        )
      );
  }
  addAccessory(id: number) {
    // const url = '/v1/api/Invoice/InvoiceItems/' + ids;
    const url = '/v1/api/DriverAccessory/' + id;
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
          accessoryId: item.id,
          // bodyNumber: item.bodyNumber,
          persianIssueDate: item.persianIssueDate, // moment(item.exportDate).locale('fa').format('YYYY/M/D'),
          amount: item.amount, // .toLocaleString(undefined, {maximumFractionDigits: 0}),
          driverFullName: item.driverTitle,
          trailerPlaque: item.trailerTitle,
          branchTitle: item.branchName,
          description: item.description
        };
        this.invoiceService.invoiceAccessory.unshift(add);
        this.snackBar.open(
          'با موفقیت به لیست اضافه شد.',
          '',
          {
            duration: 3000,
            panelClass: ['snack-bar-sucsess']
          }
        );
        // this.sendIds();
        this.invoiceService.sumAccessory();
      }
    });
  }
  add2List() {
    if (!this.invoiceService.invoiceAccessory.find(a => a.accessoryId === this.selectedId)) {
      this.addAccessory(this.selectedId);
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
    const index = this.invoiceService.invoiceAccessory.findIndex(({ accessoryId }) => accessoryId === id);
    this.invoiceService.invoiceAccessory.splice(index, 1);
    this.snackBar.open(
      'با موفقیت از لیست حذف شد.',
      '',
      {
        duration: 3000,
        panelClass: ['snack-bar-info']
      }
    );
    // this.sendIds();
    this.invoiceService.sumAccessory();
  }

  getUrl() {
    return '/v1/api/Invoice/';
  }

}
