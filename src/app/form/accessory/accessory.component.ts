import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AccessoryDialog } from './accessory.dialog';

import { AccessoryDto } from './dtos/AccessoryDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';
import { IntlService } from '@progress/kendo-angular-intl';


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'accessory-component',
  templateUrl: './accessory.component.html',
  providers: [HttpClient]
})
export class AccessoryComponent extends GridBaseClass implements OnInit {
  isEdit = false;

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/Accessory/', dialog);
    this.gridName = 'accessoryGrid';
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
    const dialogRef = this.dialog.open(AccessoryDialog, {
      width: '400px',
      height: '400px',
      disableClose: true,
      data: {
        Accessory: new AccessoryDto(null),
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
    const dialogRef = this.dialog.open(AccessoryDialog, {
      width: '400px',
      height: '400px',
      disableClose: true,
      data: {
        Accessory: data,
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
    return '/v1/api/Accessory/';
  }
  onClose(): void { }
}
