import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DriverPenaltyItemDialog } from './driver-penalty-item.dialog';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';
import { DriverPenaltyItemDto } from './dtos/DriverPenaltyItem';

@Component({
  selector: 'driver-penalty-item-component',
  templateUrl: './driver-penalty-item.component.html',
  providers: [
    HttpClient
  ],
})
export class DriverPenaltyItemComponent extends GridBaseClass {
  isEdit = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService) {
    super(http, '/v1/api/DriverPenaltyItem/', dialog);
    this.gridName = 'DriverPenaltyItemGrid';
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

    const dialogRef = this.dialog.open(DriverPenaltyItemDialog, {
      width: '400px',
      height: '250px',
      disableClose: true,
      data: {
        DriverPenaltyItem: new DriverPenaltyItemDto(null),
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
    let cmg = new DriverPenaltyItemDto(data);
    const dialogRef = this.dialog.open(DriverPenaltyItemDialog, {
      disableClose: true,
      width: '400px',
      height: '250px',
      data: {
        DriverPenaltyItem: cmg,
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
    return '/v1/api/DriverPenaltyItem/';
  }

  onClose(): void {
  }
}

