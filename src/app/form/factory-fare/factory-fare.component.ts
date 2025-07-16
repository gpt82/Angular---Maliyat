import { Component, OnInit } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FactoryFareDialog } from './factory-fare.dialog';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { FactoryFareDto } from './dtos/FactoryFareDetailDto';
import { IntlService } from '@progress/kendo-angular-intl';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'factory-fare-component',
  templateUrl: './factory-fare.component.html',
  providers: [HttpClient]
})
export class FactoryFareComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  isSuperAdmin: boolean;
  isAccUser: boolean;
  provinces: any[] = [];
  cities: any[] = [];
  public branches: any[];

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {
    super(http, '/v1/api/FactoryFare/', dialog);
    this.gridName = 'factory-fareGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
    this.isSuperAdmin = this.authService.hasRole(
      RolesConstants.SuperAdministrators
    );
    this.isAccUser = this.authService.hasRole(
      RolesConstants.AccountingUser
    );
  }

  ngOnInit() {
    this.getLookups();
  }

  public onSelect({ dataItem, item }): void {
    // const index = this.gridData.indexOf(dataItem);
    if (item === 'Move Up') {
      this.onCreate();
    }
    // else if (index < this.gridData.length - 1) {
    //   this.swap(index, index + 1);
    // }
  }
  getLookups(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe(result => (this.branches = Normalize(result)));
  }
  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(FactoryFareDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        factoryFare: new FactoryFareDto(null),
        dialogTitle: 'ایجاد',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }

  onEdit(data): void {
    const factoryFare = new FactoryFareDto(data);

    const dialogRef = this.dialog.open(FactoryFareDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        factoryFare: factoryFare,
        dialogTitle: 'ویرایش ',
        isEdit: true,
        isAccUser: this.isAccUser,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }

  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/FactoryFare/';
  }
  onClose(): void {}
}
