import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, catchError, map } from 'rxjs/operators';
import { InvoiceService } from './invoice.service';
import * as moment from 'jalali-moment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'invoice-recar-component',
  templateUrl: 'invoice-recar.component.html',

})
// tslint:disable-next-line: component-class-suffix
export class InvoiceRecarComponent implements OnInit {
  @ViewChild('invoiceDatePicker') invoiceDatePicker;

  // @Input() public invoiceRecar: any[] = [];
  selectedId: number;
  selectedTrailerId: number;

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  recarsLoading = false;
  recars$: Observable<Object | any[]>;
  recarsInput$ = new Subject<string>();

  constructor(
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public invoiceService: InvoiceService
  ) {
  }
  ngOnInit() {
    // this.recarIds = this.Ids;
    // this.getRecarList(this.recarIds);
    this.loadRecars();
    this.loadTrailers();
    // this.sendIds();
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
  private loadRecars() {
    this.recars$ =
      this.recarsInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.recarsLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/recars/' + term + '/false').pipe(
            catchError(() => of([])),
            tap(() => (this.recarsLoading = false))
          )
        )
      );
  }

  // sendIds() {
  //   this.invoiceService.invoiceRecarIds$.next();
  // }
  addTrailerItems() {
    const url = '/v1/api/Trailer/recar/' + this.selectedTrailerId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      const item = result['entities'];

      const newItems = item.filter(o1 => !this.invoiceService.invoiceRecar.some(o2 => o1.recarId === o2.recarId));
      const newItemsLength = newItems.length;
      if (newItemsLength > 0) {
        this.invoiceService.invoiceRecar.unshift(...newItems);
        this.invoiceService.sumRecar();
        this.snackBar.open(
          newItemsLength + ' مورد جدید با موفقیت به لیست اضافه شد.',
          '',
          {
            duration: 3000,
            panelClass: ['snack-bar-sucsess']
          }
          // }
        );
      } else {
        this.snackBar.open(
          'مورد جدیدی  به لیست اضافه نگردید!.',
          '',
          {
            duration: 3000,
            panelClass: ['snack-bar-fail']
          });
      }
    });
  }
  addRecar(id: number) {
    // const url = '/v1/api/Invoice/InvoiceItems/' + ids;
    const url = '/v1/api/RecurrentCar/' + id;
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
          recarId: item.id,
          bodyNumber: item.bodyNumber,
          persianExportDate: moment(item.exportDate).locale('fa').format('YYYY/M/D'),
          sender: item.senderTitle,
          driverFullName: item.driverTitle,
          trailerPlaque: item.trailerTitle,
          branchTitle: item.branchTitle,
          fare: item.fare,
        };
        this.invoiceService.invoiceRecar.unshift(add);
        this.snackBar.open(
          'با موفقیت به لیست اضافه شد.',
          '',
          {
            duration: 3000,
            panelClass: ['snack-bar-sucsess']
          }
        );
        // this.sendIds();
        this.invoiceService.sumRecar();
      }
    });
  }

  add2List() {
    // const id = this.form.get('recarId2Add').value;
    if (!this.invoiceService.invoiceRecar.find(a => a.recarId === this.selectedId)) {
      this.addRecar(this.selectedId);
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
    const index = this.invoiceService.invoiceRecar.findIndex(({ recarId }) => recarId === id);
    this.invoiceService.invoiceRecar.splice(index, 1);
    this.snackBar.open(
      'با موفقیت از لیست حذف شد.',
      '',
      {
        duration: 3000,
        panelClass: ['snack-bar-info']
      }
    );
    // this.sendIds();
    this.invoiceService.sumRecar();
  }

  getUrl() {
    return '/v1/api/Invoice/';
  }

}
