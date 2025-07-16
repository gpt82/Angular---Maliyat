import { Component, OnInit } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GeteFareDialog } from './gete-fare.dialog';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { GeteFareDto } from './dtos/Gete-FareDetailDto';
import { IntlService } from '@progress/kendo-angular-intl';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'gete-fare-component',
  templateUrl: './gete-fare.component.html',
  providers: [HttpClient]
})
export class GeteFareComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  isSuperAdmin: boolean;
  isAccUser: boolean;
  provinces: any[] = [];
  cities: any[] = [];
  public branches: any[];
  public geteLoadingLocations = [];
  public geteManufacturers = [];

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {
    super(http, '/v1/api/GeteFare/', dialog);
    this.gridName = 'getefareGrid';
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
    this.getBranchs();
    this.getGeteLoadingLocations();
    this.getGeteManufacturers();
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
  getBranchs(): void {
    this.http
    .get('/v1/api/Lookup/branchs')
    .subscribe((result: ILookupResultDto[]) => (this.branches = result));
  }
  getGeteLoadingLocations(): void {
    this.http
    .get('/v1/api/Lookup/GeteLoadingLocations')
    .subscribe((result: ILookupResultDto[]) => (this.geteLoadingLocations = result));
  }
  getGeteManufacturers(): void {
    this.http
    .get('/v1/api/Lookup/geteManufacturers')
    .subscribe((result: ILookupResultDto[]) => (this.geteManufacturers = result));
  }
  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(GeteFareDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        GeteFare: new GeteFareDto(null),
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
    const getefare = new GeteFareDto(data);

    const dialogRef = this.dialog.open(GeteFareDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        GeteFare: getefare,
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
    return '/v1/api/GeteFare/';
  }
  onClose(): void {}
}
