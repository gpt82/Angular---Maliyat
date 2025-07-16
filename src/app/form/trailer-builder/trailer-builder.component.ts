import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TrailerBuilderDialog } from './trailer-builder.dialog';

import { TrailerBuilderDto } from './dtos/TrailerBuilderDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'trailer-builder-component',
  templateUrl: './trailer-builder.component.html',
  providers: [HttpClient]
})
export class TrailerBuilderComponent extends GridBaseClass {
  isEdit = false;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/TrailerBuilder/', dialog);
    this.gridName = 'trailerBuilderGrid';
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
    const dialogRef = this.dialog.open(TrailerBuilderDialog, {
      width: '400px',
      height: '250px',
      disableClose: true,
      data: {
        TrailerBuilder: new TrailerBuilderDto(),
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

  onEdit(data): void {
    const dialogRef = this.dialog.open(TrailerBuilderDialog, {
      width: '400px',
      height: '250px',
      disableClose: true,
      data: {
        TrailerBuilder: data,
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
    return '/v1/api/TrailerBuilder/';
  }
  onClose(): void { }
}
