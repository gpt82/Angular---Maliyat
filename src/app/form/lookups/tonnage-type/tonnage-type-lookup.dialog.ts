import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { TonnageTypeDto } from '../../tonnage-type/dtos/TonnageTypeDto';
import { TonnageTypeDialog } from '../../tonnage-type/tonnage-type.dialog';
import { GridBaseClass } from '../../../shared/services/grid-base-class';

@Component({
  selector: 'tonnage-type-lookup-component',
  templateUrl: './tonnage-type-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class TonnageTypeLookupComponent extends GridBaseClass {
  getUrl(): string {
    return '/v1/api/TonnageType/';
  }
  onEdit(data: any): void {
  }
  constructor(
    public dialogRef: MatDialogRef<TonnageTypeLookupComponent>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, '/v1/api/TonnageType/', dialog);
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
    const dialogRef = this.dialog.open(TonnageTypeDialog, {
      width: '400px',
      height: '365px',
      disableClose: true,
      data: {
        TonnageType: new TonnageTypeDto(),
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

  onClose(): void {
    this.dialogRef.close({ data: null });
  }
}

