
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'target-branch-component',
  templateUrl: './target-branch.component.html',
  styles: [
    `
      .k-grid tr.even {
        background-color: #f45c42;
      }
      .k-grid tr.odd {
        background-color: #41f4df;
      }
    `
  ],
  providers: [
    HttpClient
  ],


})
export class TargetBranchComponent extends GridBaseClass {
  public branchs: any[];
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService) {
    super(http, '/v1/api/Agenda/targetBranch/', dialog);
    this.gridName = 'target-branchGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
    this.getBranchs();
  }
  isEdit = false;
  onCreate(): void {
  }
  onEdit(data: any): void {
  }
  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }
  getRowClass({ dataItem, index }) {

    const isKaf =
      dataItem.entity.kafId > 0;
    return {
      even: isKaf,
      odd: !isKaf
    };
    // if (dataItem == null) {
    //   return '';
    // }
    // return {
    //   canceled: dataItem.entity.state === 2,
    //   '': dataItem.entity.state !== 2
    // };
  }
  getUrl() {
    return '/v1/api/Agenda/targetBranch/';
  }
  onClose(): void { }
}

