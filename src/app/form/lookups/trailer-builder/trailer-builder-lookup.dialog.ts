import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { TrailerBuilderDialog } from '../../trailer-builder/trailer-builder.dialog';
import { TrailerBuilderDto } from '../../trailer-builder/dtos/TrailerBuilderDto';
import { GridBaseClass } from '../../../shared/services/grid-base-class';

@Component({
  selector: 'trailer-builder-lookup-component',
  templateUrl: './trailer-builder-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class TrailerBuilderLookupComponent extends GridBaseClass {
  getUrl(): string {
    return '/v1/api/TrailerBuilder/';
  }
  onEdit(data: any): void {
  }
  constructor(
    public dialogRef: MatDialogRef<TrailerBuilderLookupComponent>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, '/v1/api/TrailerBuilder/', dialog);
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
    const dialogRef = this.dialog.open(TrailerBuilderDialog, {
      width: '400px',
      height: '365px',
      disableClose: true,
      data: {
        TrailerBuilder: new TrailerBuilderDto(),
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

