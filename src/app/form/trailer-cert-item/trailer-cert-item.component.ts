import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TrailerCertItemDialog } from './trailer-cert-item.dialog';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';
import { TrailerCertItemDto } from './dtos/TrailerCertItem';

@Component({
  selector: 'trailer-cert-item-component',
  templateUrl: './trailer-cert-item.component.html',
  providers: [
    HttpClient
  ],
})
export class TrailerCertItemComponent extends GridBaseClass {
  isEdit = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService) {
    super(http, '/v1/api/TrailerCertItem/', dialog);
    this.gridName = 'TrailerCertItemGrid';
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

    const dialogRef = this.dialog.open(TrailerCertItemDialog, {
      width: '400px',
      height: '250px',
      disableClose: true,
      data: {
        TrailerCertItem: new TrailerCertItemDto(null),
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
    let cmg = new TrailerCertItemDto(data);
    const dialogRef = this.dialog.open(TrailerCertItemDialog, {
      disableClose: true,
      width: '400px',
      height: '250px',
      data: {
        TrailerCertItem: cmg,
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
    return '/v1/api/TrailerCertItem/';
  }

  onClose(): void {
  }
}

