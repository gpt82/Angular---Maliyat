import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CarManufacturerGroupDialog } from '../../car-manufacturer-group/car-manufacturer-group.dialog';
import { CarManufacturerGroupDto } from '../../car-manufacturer-group/dtos/CarManufacturerGroupDto';
import { GridBaseClass } from '../../../shared/services/grid-base-class';

@Component({
  selector: 'car-Manufacturer-group-lookup-component',
  templateUrl: './car-Manufacturer-group-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class CarManufacturerGroupLookup extends GridBaseClass {
  getUrl(): string {
    return "/v1/api/CarManufacturerGroup/";
  }
  onEdit(data: any): void {
  }
  isEdit = false;
  constructor(
    public dialogRef: MatDialogRef<CarManufacturerGroupLookup>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, "/v1/api/CarManufacturerGroup/",dialog);
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
    let dialogRef = this.dialog.open(CarManufacturerGroupDialog, {
      width: "400px",
      height: "365px",
      disableClose: true,
      data: {
        CarManufacturerGroup: new CarManufacturerGroupDto(null),
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

