import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConsumerItemDialog } from './consumer-item.dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { ConsumerItemDto } from './dtos/ConsumerItemDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'consumer-item-component',
  templateUrl: './consumer-item.component.html',
  providers: [HttpClient]
})
export class ConsumerItemComponent extends GridBaseClass implements OnInit {
  isEdit = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/ConsumerItem/', dialog);
    this.gridName = 'consumer-itemGrid';
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
    const dialogRef = this.dialog.open(ConsumerItemDialog, {
      width: '400px',
      height: '400px',
      disableClose: true,
      data: {
        ConsumerItem: new ConsumerItemDto(null),
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
    const dialogRef = this.dialog.open(ConsumerItemDialog, {
      width: '400px',
      height: '400px',
      disableClose: true,
      data: {
        ConsumerItem: data,
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
    return '/v1/api/ConsumerItem/';
  }
  onClose(): void { }
}
