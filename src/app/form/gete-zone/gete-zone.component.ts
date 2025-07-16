import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GeteZoneDialog } from './gete-zone.dialog';

import { GeteZoneDto } from './dtos/GeteZoneDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  selector: 'gete-zone-component',
  templateUrl: './gete-zone.component.html',
  providers: [
    HttpClient
  ],


})
export class GeteZoneComponent extends GridBaseClass {
  isEdit = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService) {
    super(http, '/v1/api/GeteZone/', dialog);
    this.gridName = 'geteZoneGrid';
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

    const dialogRef = this.dialog.open(GeteZoneDialog, {
      width: '400px',
      height: '250px',
      disableClose: true,
      data: {
        GeteZone: new GeteZoneDto(),
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
  onEdit(editData): void {
    const dialogRef = this.dialog.open(GeteZoneDialog, {
      disableClose: true,
      width: '400px',
      height: '250px',
      data: {
        GeteZone: editData,
        dialogTitle: 'ویرایش ',
        isEdit: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }

  onDeleteById(id): void {
    this.deleteEntity(id);
  }
  getUrl() {
    return '/v1/api/GeteZone/';
  }
  onClose(): void { }
}

