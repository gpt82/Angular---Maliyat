import { Component, Inject, HostListener } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { LoadingLocationDto } from '../../loading-location/dtos/LoadingLocationDto';
import { LoadingLocationDialog } from '../../loading-location/loading-location.dialog';
import { GridBaseClass } from '../../../shared/services/grid-base-class';

@Component({
  selector: 'loading-location-lookup-component',
  templateUrl: './loading-location-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class LoadingLocationLookupComponent extends GridBaseClass {
  getUrl(): string {
    return '/v1/api/LoadingLocation/';
  }
  onEdit(data: any): void {
  }
  constructor(
    public dialogRef: MatDialogRef<LoadingLocationLookupComponent>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, '/v1/api/LoadingLocation/', dialog);
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
    const dialogRef = this.dialog.open(LoadingLocationDialog, {
      width: '400px',
      height: '365px',
      disableClose: true,
      data: {
        LoadingLocation: new LoadingLocationDto(),
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

