import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { IssicoNameDialog } from './issico-name.dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { IssicoNameDto } from './dtos/IssicoNameDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'issico-name-component',
  templateUrl: './issico-name.component.html',
  providers: [HttpClient]
})
export class IssicoNameComponent extends GridBaseClass implements OnInit {
  isEdit = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/IssicoName/', dialog);
    this.gridName = 'billTypeGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }
  ngOnInit() {
  } fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(IssicoNameDialog, {
      width: '400px',
      height: '400px',
      disableClose: true,
      data: {
        IssicoName: new IssicoNameDto(null),
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
    const dialogRef = this.dialog.open(IssicoNameDialog, {
      width: '400px',
      height: '400px',
      disableClose: true,
      data: {
        IssicoName: data,
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
    return '/v1/api/IssicoName/';
  }
  onClose(): void { }
}
