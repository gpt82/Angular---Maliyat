import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { TrailerOwnerTypeDialog } from '../../trailer-owner-type/trailer-owner-type.dialog';
import { TrailerOwnerTypeDto } from '../../trailer-owner-type/dtos/TrailerOwnerTypeDto';
import { GridBaseClass } from '../../../shared/services/grid-base-class';

@Component({
  selector: 'trailer-owner-lookup-component',
  templateUrl: './trailer-owner-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class TrailerOWnerTypeLookup extends GridBaseClass {
  getUrl(): string {
    return "/v1/api/TrailerOwnerType/";
  }
  onEdit(data: any): void {
  }
  constructor(
    public dialogRef: MatDialogRef<TrailerOWnerTypeLookup>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, "/v1/api/TrailerOwnerType/",dialog);
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
    let dialogRef = this.dialog.open(TrailerOwnerTypeDialog, {
      width: "400px",
      height: "365px",
      disableClose: true,
      data: {
        TrailerOwnerType: new TrailerOwnerTypeDto(),
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

