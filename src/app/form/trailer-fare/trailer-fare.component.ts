import { Component, OnInit } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TrailerFareDialog } from './trailer-fare.dialog';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { TrailerFareDto } from './dtos/TrailerFareDetailDto';
import { IntlService } from '@progress/kendo-angular-intl';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'fare-component',
  templateUrl: './trailer-fare.component.html',
  providers: [HttpClient]
})
export class TrailerFareComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  isSuperAdmin: boolean;
  isAccUser: boolean;
  provinces: any[] = [];
  cities: any[] = [];
  public branchs: any[];
  public tonnageTypes: any[];
  public senders: any[];

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/TrailerFare/', dialog);
    this.gridName = 'fareGrid';
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
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/tonnageTypes')
      .subscribe((result: ILookupResultDto[]) => (this.tonnageTypes = result));
  }
  getTonnageTypes(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }
  getSenders(): void {
    this.http
      .get('/v1/api/Lookup/senders')
      .subscribe((result: ILookupResultDto[]) => (this.senders = result));
  }
  getLookups(): void {
    this.getBranchs();
    this.getTonnageTypes();
    this.getSenders();
  }
  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(TrailerFareDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        TrailerFare: new TrailerFareDto(null),
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
    const fare = new TrailerFareDto(data);

    const dialogRef = this.dialog.open(TrailerFareDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        TrailerFare: fare,
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
    return '/v1/api/TrailerFare/';
  }
  onClose(): void {}
}
