import { Observable } from 'rxjs';
import { State } from '@progress/kendo-data-query';
import { GridService } from './grid.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HostListener, Injectable } from '@angular/core';
import {
  DataStateChangeEvent,
  GridDataResult,
  RowArgs
} from '@progress/kendo-angular-grid';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialog } from '../dialogs/Delete/delete.dialog';
import { ModalCordinate } from '../dtos/ModalCordinate';
import { encodeBase64 } from '@progress/kendo-file-saver';
import { ObserveOnMessage } from 'rxjs/internal/operators/observeOn';

@Injectable()
export abstract class GridBaseClass {
  modalCordinate: ModalCordinate = new ModalCordinate(0, 0);
  public isMobile: Boolean;
  public deviceHeight: number;
  SearchText = '';
  public selectedRowIds: any[] = [];
  lastSelectedId: number;
  filterModel: any = {};
  filters: any[] = [];
  public gridName: string;
  public view: Observable<GridDataResult>;
  public selection: number[];
  public hiddenColumns: string[] = [];
  public state: State = {
    skip: 0,
    take: 15,

    // Initial filter descriptor
    filter: {
      logic: 'and',
      filters: []
      // filters: [{ field: 'id', operator: 'contains', value: this.selectedRowIds }]
    }
  };
  service: GridService;
  isBusy: any = { value: false };
  public id = args => args.dataItem;
  res;
  constructor(
    private httpClient: HttpClient,
    private gridUrl: string,
    public dialog: MatDialog
  ) {
    this.service = new GridService(httpClient);
    this.isMobile = +window.innerWidth < 992;
    this.deviceHeight = +window.innerHeight;

  }
  public mySelectionKey(context: RowArgs): string {
    // let s = this.mySelection.map(a=>a['entity'].id);
    return context.dataItem.entity.id; // + ' ' + context.index;
  }
  filterBySearchText(e): void {
    if (e.keyCode === 13) {
      this.applyGridFilters(this.getUrl() + this.SearchText);
      this.view = this.service;
      this.stopPropagationEvent(e);
    }
  }

  onChange(): void {
    this.filters = [];
    this.filters.push({
      field: 'Name',
      value: this.filterModel.name,
      operator: 'contains'
    });
    this.fillGrid();
  }

  applyGridFilters(url: string = '') {
    const headers = this.getGridFilterHeader();
    this.service.query({ headers: headers }, url !== '' ? url : this.gridUrl);
  }

  getGridFilterHeader(): any {
    // const filters = [];
    // for (let i = 0 ; i < this.selectedRowIds.length ; i++) {
    // filters.push({ field: 'entity.id', operator: 'eq', value: this.selectedRowIds[i] });
    // }
    const obj = {
      page: {
        Skip: this.state.skip,
        Take: this.state.take
      },
      Filters:
        this.state.filter && this.state.filter.filters
          ? this.state.filter.filters
          : null,
      Group: this.state.group,
      Sorts: this.state.sort
    };
    // let s = this.state.filter.filters
    //  console.log(Object.assign(...obj.Filters))
    //  obj.Filters.push(...filters);
    const headers = new HttpHeaders({
      filters: encodeBase64(JSON.stringify(obj))
    });
    headers.append(
      'Content-Type',
      'application/x-www-form-urlencoded;charset=UTF-8'
    );
    return headers;
  }
  //  flatten(array){
  //   array.forEach(function(obj){
  //       var name = {name: obj.name}
  //       this.res.push(name);
  //       if(obj.children){
  //          this.flatten(obj.children)
  //        }
  //    })
  //   //  return res;
  // }
  @HostListener('keydown', ['$event'])
  public keydown(event: any): void {
    if (event.keyCode === 27) {
      this.onClose();
      this.stopPropagationEvent(event);
    }
    if (event.code === 'Delete') {
      const selectedRow = this.selectedRowIds[0].entity;
      if (selectedRow == null) { return; }

      const dialogRef = this.dialog.open(DeleteDialog, {
        width: '250px',
        data: { state: 'ok' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) { this.deleteEntity(selectedRow.entity.id); }
        this.resetSelectedRowIds();
      });
    } else if (event.code === 'F2') {
      const selectedRow = this.selectedRowIds[0].entity;
      if (selectedRow == null) { return; }
      this.onEdit(selectedRow);
    } else if (event.ctrlKey && event.keyCode === 13) {
      this.onCreate();
    } else if (event.shiftKey && event.code === 'KeyR') {
      this.resetSelectedRowIds();
      console.log('empty');
    }
    console.log(event);
  }

  deleteEntity(id: any, url = ''): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    url = url !== '' ? url : this.getUrl();
    this.httpClient
      .delete(url + id, { headers: headers1 })
      .subscribe(result => {
        this.fillGrid();
      });
  }

  getEntity(id: any, url = ''): Observable<any> {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    url = url !== '' ? url : this.getUrl();
    return this.httpClient.get<any>(url + id, { headers: headers1 });
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.saveGridState();
    this.fillGrid();

  }

  getState<T>(): T {
    const settings = localStorage.getItem(this.gridName);
    return settings ? JSON.parse(settings) : settings;
  }

  setState<T>(token: string, gridConfig: State): void {
    localStorage.setItem(token, JSON.stringify(gridConfig));
    // localStorage.setItem(token+'column', JSON.stringify(visibleCol));
  }
  removeState() {
    localStorage.removeItem(this.gridName);
    this.state = {
      skip: 0,
      take: 15,
      sort: []
    }
    this.applyGridFilters();
  }

  saveGridState(): void {
    // در صورتیکه دایرکشن آیتم های سورت نال باشند آن آیتم فیلتر می شود
    if (this.state.sort.map(m => m.dir).filter(n => n).length == 0)
      this.state.sort = [];
    const gridState = this.state;
    this.setState(this.gridName, gridState);
  }

  resetSelectedRowIds(): void {
    this.selectedRowIds = [];
  }

  getFirstSelectedItem2(view: Observable<any>): any {
    const selectedRowNumber = this.getSelectedRow();
    if (selectedRowNumber === -1) {
      return null;
    }
    const data = view['value'].data[this.getSelectedRow()];
    return data;
  }

  getSelectedRow(): number {
    if (
      this.selectedRowIds == null ||
      this.selectedRowIds === undefined ||
      this.selectedRowIds.length < 1
    ) {
      return -1;
    }
    const skipRows = this.state.skip;
    const lastArrayIndex = this.selectedRowIds.length - 1;
    const lastSelectedRowNumber = this.selectedRowIds[lastArrayIndex];
    return lastSelectedRowNumber - skipRows;
  }

  stopPropagationEvent(event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  setModalCordinate(width: number, height: number) {
    this.modalCordinate = new ModalCordinate(width, height);
  }

  abstract onCreate(): void;

  abstract onEdit(data): void;

  abstract fillGrid(): void;

  abstract getUrl(): string;

  abstract onClose(): void;
}
