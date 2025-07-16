import {Component, OnInit, ViewEncapsulation, Inject} from '@angular/core';
import {Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {CityDialog} from './city.dialog';

import {CityDto} from './dtos/CityDto';
import {HttpClient} from '@angular/common/http';
import {GridBaseClass} from '../../shared/services/grid-base-class';
import {State} from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  selector: 'city-component',
  templateUrl: './city.component.html',
  providers: [
    HttpClient
  ]
})
export class CityComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  canCreate= false;
  SearchText = '';
  provinces: any[] = [];
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService) {
    super(http, '/v1/api/Gis/City', dialog);
    this.gridName = 'cityGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  ngOnInit() {
    this.canCreate = ['میثم'].some(substring => this.authService.getFullName().includes(substring));
    // this.getLookups();
  }
  
//   getLookups() : void {
//     this.http.get("/v1/api/Lookup/provinces").subscribe(result => this.provinces = Normalize(result));
//   }
  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  filterByCity(e): void {
    if (e.keyCode !== 13) {
      return;
    }

    this.applyGridFilters(this.getUrl() + 'City/' + this.SearchText);
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(CityDialog, {
      width: '400px',
      height: '390px',
      disableClose: true,
      data: {
        City: new CityDto(null),
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

  onEdit(editData): void {
    const city = new CityDto(editData);
    const dialogRef = this.dialog.open(CityDialog, {
      disableClose: true,
      width: '400px',
      height: '390px',
      data: {
        City: city,
        dialogTitle: 'ویرایش ',
        isEdit: true
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
    return '/v1/api/gis/';
  }

  onClose(): void {
  }
}
