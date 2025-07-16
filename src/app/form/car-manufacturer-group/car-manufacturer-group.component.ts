import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CarManufacturerGroupDialog } from './car-manufacturer-group.dialog';
import { CarManufacturerGroupDto } from './dtos/CarManufacturerGroupDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  selector: 'car-Manufacturer-group-component',
  templateUrl: './car-Manufacturer-group.component.html',
  providers: [
    HttpClient
  ],


})
export class CarManufacturerGroupComponent extends GridBaseClass {
  isEdit = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService) {
    super(http, '/v1/api/CarManufacturerGroup/', dialog);
    this.gridName = 'CarManufacturerGroupGrid';
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

    const dialogRef = this.dialog.open(CarManufacturerGroupDialog, {
      width: '400px',
      height: '250px',
      disableClose: true,
      data: {
        CarManufacturerGroup: new CarManufacturerGroupDto(null),
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
    let cmg = new CarManufacturerGroupDto(data);
    const dialogRef = this.dialog.open(CarManufacturerGroupDialog, {
      disableClose: true,
      width: '400px',
      height: '250px',
      data: {
        CarManufacturerGroup: cmg,
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
    return '/v1/api/CarManufacturerGroup/';
  }

  onClose(): void {
  }
}

