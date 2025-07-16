import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { HttpClient } from '@angular/common/http';
import { CarManufacturerDto } from '../../car-manufacturer/dtos/CarManufacturerDto';
import { CarManufacturerDialog } from '../../car-manufacturer/car-manufacturer.dialog';
import { GridBaseClass } from '../../../shared/services/grid-base-class';

@Component({
  selector: 'car-Manufacturer-lookup-component',
  templateUrl: './car-Manufacturer-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class CarManufacturerLookup extends GridBaseClass {
  getUrl(): string {
    return "/v1/api/CarManufacturer/";
  }
  onEdit(data: any): void {
  }
  isEdit = false;
  constructor(
    public dialogRef: MatDialogRef<CarManufacturerLookup>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, "/v1/api/CarManufacturer/",dialog);
    this.fillGrid();
  }
  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  onSelect(item): void {
    this.dialogRef.close({ data: { selectedItem: item } });
  }

  onCreate(): void {
    let dialogRef = this.dialog.open(CarManufacturerDialog, {
      width: "400px",
      height: "365px",
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

  onClose(): void {
    this.dialogRef.close({ data: null });
  }
}

