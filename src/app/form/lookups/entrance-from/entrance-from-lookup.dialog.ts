import { Component, Inject} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  GridDataResult,
  DataStateChangeEvent
} from '@progress/kendo-angular-grid';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../../shared/services/grid-base-class';
import { EntranceFromDialog } from '../../entrance-from/entrance-from.dialog';
import { EntranceFromDto } from '../../entrance-from/dtos/EntranceFromDto';

@Component({
  selector: 'entrance-from-lookup-component',
  templateUrl: './entrance-from-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class EntranceFromLookup extends GridBaseClass {
  getUrl(): string {
    return "/v1/api/EntranceFrom/";
  }
  onEdit(data: any): void {
  }
  constructor(
    public dialogRef: MatDialogRef<EntranceFromLookup>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, "/v1/api/EntranceFrom/",dialog);
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
    let dialogRef = this.dialog.open(EntranceFromDialog, {
      width: "400px",
      height: "365px",
      disableClose: true,
      data: {
        EntranceFrom: new EntranceFromDto(),
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

