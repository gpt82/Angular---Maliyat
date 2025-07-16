import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CarManufacturerDialog } from './car-manufacturer.dialog';

import { CarManufacturerDto } from './dtos/CarManufacturerDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  selector: 'car-Manufacturer.component',
  templateUrl: './car-Manufacturer.component.html'
})
export class CarManufacturerComponent extends GridBaseClass {
  isEdit = false;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService) {
    super(http, '/v1/api/CarManufacturer/', dialog);
    this.gridName = 'CarManufacturerGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(CarManufacturerDialog, {
      width: '400px',
      height: '400px',
      disableClose: true,
      data: {
        CarManufacturer: new CarManufacturerDto(null),
        dialogTitle: 'ایجاد',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state == 'successful') {
        this.fillGrid();
      }
    });
  }

  onEdit(data): void {
    let cm = new CarManufacturerDto(data);
    const dialogRef = this.dialog.open(CarManufacturerDialog, {
      disableClose: true,
      width: '400px',
      height: '400px',
      data: {
        CarManufacturer: Object.assign({}, cm),
        dialogTitle: 'ویرایش ',
        isEdit: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state == 'successful') {
        this.fillGrid();
      }
    });

  }

  onDeleteById(id): void {
    this.deleteEntity(id);
  }
  getUrl() {
    return '/v1/api/CarManufacturer/';
  }
  onClose(): void { }
}

