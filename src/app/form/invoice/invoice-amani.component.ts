import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, catchError, map } from 'rxjs/operators';
import { InvoiceService } from './invoice.service';
import * as moment from 'jalali-moment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'invoice-amani-component',
  templateUrl: 'invoice-amani.component.html',

})
// tslint:disable-next-line: component-class-suffix
export class InvoiceAmaniComponent implements OnInit {
  @ViewChild('invoiceDatePicker') invoiceDatePicker;

  // @Input() public invoiceAmani: any[] = [];
  selectedId: number;
  selectedTrailerId: number;
  amanisLoading = false;
  amanis$: Observable<Object | any[]>;
  amanisInput$ = new Subject<string>();

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  constructor(
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public invoiceService: InvoiceService
  ) {
  }
  ngOnInit() {
    // this.amaniIds = this.Ids;
    // this.getAmaniList(this.amaniIds);
    this.loadTrailers();
    this.loadAmanis();
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

  private loadAmanis() {
    this.amanis$ =
      this.amanisInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.amanisLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/amanis/' + term + '/false').pipe(
            catchError(() => of([])),
            tap(() => (this.amanisLoading = false))
          )
        )
      );
  }

  // sendIds() {
  //   // const d = this.invoiceService.invoiceAmani.map(i => i.amaniId).join();
  //   // console.log(this.invoiceService.invoiceAmani.map(i => i.amaniId).join());
  //   this.invoiceService.invoiceAmaniIds$.next();
  // }
  addAmani(id: number) {
    // const url = '/v1/api/Invoice/InvoiceItems/' + ids;
    const url = '/v1/api/amani/' + id;
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
          amaniId: item.id,
          bodyNumber: item.bodyNumber,
          agendaNumber: item.agendaTitle.substring(0, 6),
          persianExportDate: moment(item.exportDate).locale('fa').format('YYYY/M/D'),
          sender: item.senderTitle,
          driverFullName: item.driverTitle,
          trailerPlaque: item.trailerTitle,
          branchTitle: item.branchTitle,
          fare: item.fare
        };
        this.invoiceService.invoiceAmani.push(add);
        this.invoiceService.sumAmani();
        this.snackBar.open(
          'با موفقیت به لیست اضافه شد.',
          '',
          {
            duration: 3000,
            panelClass: ['snack-bar-sucsess']
          }
        );
        // this.sendIds();
      }
    });
  }
  add2List() {
    // const id = this.form.get('amaniId2Add').value;
    if (!this.invoiceService.invoiceAmani.find(a => a.amaniId === this.selectedId)) {
      this.addAmani(this.selectedId);
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
  addTrailerAmanis() {
    // const url = '/v1/api/Invoice/InvoiceItems/' + ids;
    const url = '/v1/api/Trailer/amanis/' + this.selectedTrailerId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      const item = result['entities'];

      const newItems = item.filter(o1 => !this.invoiceService.invoiceAmani.some(o2 => o1.amaniId === o2.amaniId));
      const newItemsLength = newItems.length;
      if (newItemsLength > 0) {
        this.invoiceService.invoiceAmani.unshift(...newItems);
        this.invoiceService.sumAmani();
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
  public removeHandler(id: number): void {
    const index = this.invoiceService.invoiceAmani.findIndex(({ amaniId }) => amaniId === id);
    this.invoiceService.invoiceAmani.splice(index, 1);
    this.snackBar.open(
      'با موفقیت از لیست حذف شد.',
      '',
      {
        duration: 3000,
        panelClass: ['snack-bar-info']
      }
    );
    this.invoiceService.sumAmani();
  }

  getUrl() {
    return '/v1/api/Invoice/';
  }

}
