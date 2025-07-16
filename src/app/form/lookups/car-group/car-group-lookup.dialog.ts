import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  GridDataResult,
  DataStateChangeEvent
} from '@progress/kendo-angular-grid';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CarGroupDto } from '../../car-group/dtos/CarGroupDto';
import { CarGroupDialog } from '../../car-group/car-group.dialog';
import { GridBaseClass } from '../../../shared/services/grid-base-class';
import { SUPER_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'car-group-lookup-component',
  templateUrl: './car-group-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class CarGroupLookup extends GridBaseClass {
  getUrl(): string {
    return "/v1/api/CarGroup/";
  }
  onEdit(data: any): void {
  }
  isEdit = false;
  constructor(
    public dialogRef: MatDialogRef<CarGroupLookup>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, "/v1/api/CarGroup/",dialog);
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
    let dialogRef = this.dialog.open(CarGroupDialog, {
      width: "400px",
      height: "365px",
      disableClose: true,
      data: {
        CarGroup: new CarGroupDto(),
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

