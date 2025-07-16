import {Component} from '@angular/core';

import {Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {TonnageTypeDialog} from './tonnage-type.dialog';

import {TonnageTypeDto} from './dtos/TonnageTypeDto';
import {HttpClient} from '@angular/common/http';
import {GridBaseClass} from '../../shared/services/grid-base-class';
import {State} from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'tonnage-type-component',
  templateUrl: './tonnage-type.component.html',
  providers: [
    HttpClient
  ],


})
export class TonnageTypeComponent extends GridBaseClass {
  isEdit = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService) {
    super(http, '/v1/api/TonnageType/', dialog);
    this.gridName = 'tonnageTypeGrid';
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

  onEdit(data): void {
    const dialogRef = this.dialog.open(TonnageTypeDialog, {
      width: '400px',
      height: '365px',
      disableClose: true,
      data: {
        TonnageType: data,
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
    return '/v1/api/TonnageType/';
  }

  onClose(): void {
  }
}

