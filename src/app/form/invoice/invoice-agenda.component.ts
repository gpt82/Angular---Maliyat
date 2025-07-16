import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, catchError, map } from 'rxjs/operators';
import { InvoiceService } from './invoice.service';
import * as moment from 'jalali-moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IntlService } from '@progress/kendo-angular-intl';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'invoice-agenda-component',
  templateUrl: 'invoice-agenda.component.html',

})

export class InvoiceAgendaComponent implements OnInit {
  public aggregates: any[] = [{ field: 'driverFullName', aggregate: 'count' }, { field: 'remainingFare', aggregate: 'sum' }];

  public state: State = {
    skip: 0,
    group: []
  };
  s: DataStateChangeEvent = {
    skip: 0,
    take: 5,
    group: []
  };
  // @Input() public invoiceAgenda: any[] = [];
  selectedId: number;
  public selectedagendas: number[] = [];
  public mySelection: number[] = [];
  agendasLoading = false;
  agendas$: Observable<Object | any[]>;
  agendasInput$ = new Subject<string>();
  public selectableSettings: SelectableSettings = {
    enabled: true
  };
  constructor(
    public intl: IntlService,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public invoiceService: InvoiceService
  ) {

  }

  // public data = this.invoiceService.invoiceAgenda;

  public gridData: any = process(this.invoiceService.invoiceAgenda, this.state);

  public dataStateChange(state: DataStateChangeEvent): void {
    if (state && state.group) {
      state.group.map(group => group.aggregates = this.aggregates);
    }

    this.state = state;

    this.gridData = process(this.invoiceService.invoiceAgenda, this.state);
    console.log(this.invoiceService.invoiceAgenda);
  }

  ngOnInit() {
    this.loadAgendas();
    this.loadItems();
  }
  private loadItems(): void {
    this.gridData = process(this.invoiceService.invoiceAgenda, { group: [] });
  }
  onCellClick() {
    // this.mySelection = this.invoiceService.selectedagendas.map(x => +x);
    // this.invoiceService.isNewAddedList();
  }
  private loadAgendas() {
    this.agendas$ =
      this.agendasInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.agendasLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/agendas/' + term + '/false').pipe(
            catchError(() => of([])),
            tap(() => (this.agendasLoading = false))
          )
        )
      );
  }

  // sendIds() {
  //   this.invoiceService.invoiceAgendaIds$.next();
  // }
  addAgenda(id: number) {
    // const url = '/v1/api/Invoice/InvoiceItems/' + ids;
    const url = '/v1/api/agenda/' + id;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      const item = result['entity'];
      if (item.invoiceId > 0) {
        this.http.get('/v1/api/Invoice/' + item.invoiceId, { headers: headers }).subscribe(res => {
          const ag = res['entity'];
          alert(` در صورتحساب شماره  ${ag.invoiceNumber}   در تاریخ  ${moment(ag.exportDate).locale('fa').format('YYYY/M/D')}  تسویه شد`);
        });
      } else {
        // if (!this.invoiceService.invoiceAgenda.find(br => br.agendaId == item.id)) {
          const add = {
            agendaId: item.id,
            agendaNumber: item.waybillNumber + '(' + item.waybillSeries + ')',
            persianExportDate: moment(item.exportDate).locale('fa').format('YYYY/M/D'),
            agentCode: item.receiverTitle,
            driverFullName: item.driverTitle,
            trailerPlaque: item.trailerTitle,
            branchTitle: item.branchTitle,
            remainingFare: item.remainingFare
          };
          this.invoiceService.invoiceAgenda.unshift(add);
          // this.invoiceService.sumAgenda();
          // this.invoiceService.isNewAddedList();
          // this.selectedagendas = this.invoiceService.selectedagendas.map(x => +x);
          // this.mySelection = this.invoiceService.selectedagendas.map(x => +x);
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
    if (!this.invoiceService.invoiceAgenda.find(a => a.agendaId === this.selectedId)) {
    this.addAgenda(this.selectedId);
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
    const index = this.invoiceService.invoiceAgenda.findIndex(({ agendaId }) => agendaId === id);
    this.invoiceService.invoiceAgenda.splice(index, 1);
    this.gridData = process(this.invoiceService.invoiceAgenda, this.state);
    console.log('after del');
    console.log(this.invoiceService.invoiceAgenda);
    console.log(this.state);
    this.snackBar.open(
      'با موفقیت از لیست حذف شد.',
      '',
      {
        duration: 3000,
        panelClass: ['snack-bar-info']
      }
    );
    // this.sendIds();
    this.invoiceService.sumAgenda();
  }

  getUrl() {
    return '/v1/api/Invoice/';
  }
}
