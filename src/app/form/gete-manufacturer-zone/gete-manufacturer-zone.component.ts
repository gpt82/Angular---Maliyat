import { Component, OnInit } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GeteManufacturerZoneDialog } from './gete-manufacturer-zone.dialog';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { GeteManufacturerZoneDto } from './dtos/gete-manufacturer-zoneDetailDto';
import { IntlService } from '@progress/kendo-angular-intl';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'gete-manufacturer-zone-component',
  templateUrl: './gete-manufacturer-zone.component.html',
  providers: [HttpClient]
})
export class GeteManufacturerZoneComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  isSuperAdmin: boolean;
  isAccUser: boolean;
  public geteLoadingLocations = [];
  public geteManufacturers = [];
  public getZones = [];

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {
    super(http, '/v1/api/GeteManufacturerZone/', dialog);
    this.gridName = 'geteManufacturerZoneGrid';
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
    this.getGeteZones();
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
  getGeteZones(): void {
    this.http
    .get('/v1/api/Lookup/geteZones')
    .subscribe((result: ILookupResultDto[]) => (this.getZones = result));
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
    const dialogRef = this.dialog.open(GeteManufacturerZoneDialog, {
      width: '350px',
      height: '450px',
      disableClose: true,
      data: {
        GeteManufacturerZone: new GeteManufacturerZoneDto(null),
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
    const geteManufacturerZone = new GeteManufacturerZoneDto(data);

    const dialogRef = this.dialog.open(GeteManufacturerZoneDialog, {
      width: '350px',
      height: '450px',
      disableClose: true,
      data: {
        GeteManufacturerZone: geteManufacturerZone,
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
    return '/v1/api/GeteManufacturerZone/';
  }
  onClose(): void {}
}
