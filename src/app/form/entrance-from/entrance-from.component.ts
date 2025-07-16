import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EntranceFromDialog } from './entrance-from.dialog';

import { EntranceFromDto } from './dtos/EntranceFromDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  selector: 'entrance-from-component',
  templateUrl: './entrance-from.component.html',
  providers: [
    HttpClient
  ],


})
export class EntranceFromComponent extends GridBaseClass {

  isEdit = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService) {
    super(http, '/v1/api/EntranceFrom/', dialog);
    this.gridName = 'entranceFromGrid';
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
    const dialogRef = this.dialog.open(EntranceFromDialog, {
      width: '400px',
      height: '250px',
      disableClose: true,
      data: {
        EntranceFrom: new EntranceFromDto(),
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
    const dialogRef = this.dialog.open(EntranceFromDialog, {
      disableClose: true,
      width: '400px',
      height: '250px',
      data: {
        EntranceFrom: editData,
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
    return '/v1/api/EntranceFrom/';
  }

  onClose(): void {
  }
}

