import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PackagingDialog } from './packaging.dialog';
import { PackagingDto } from './dtos/PackagingDto';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'packaging-component',
  templateUrl: './packaging.component.html',
  providers: [HttpClient]
})
export class PackagingComponent extends GridBaseClass {
  isEdit = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/Packaging/', dialog);
    this.gridName = 'packagingGrid';
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
    let dialogRef = this.dialog.open(PackagingDialog, {
      width: '400px',
      height: '250px',
      disableClose: true,
      data: {
        Packaging: new PackagingDto(),
        dialogTitle: 'ایجاد',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state == 'successful') {
        this.fillGrid();
      }
    });
  }

  onEdit(data): void {
    let dialogRef = this.dialog.open(PackagingDialog, {
      width: '400px',
      height: '250px',
      disableClose: true,
      data: {
        Packaging: Object.assign({}, data),
        dialogTitle: 'ویرایش ',
        isEdit: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state == 'successful') {
        this.fillGrid();
      }
    });
  }

  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/Packaging/';
  }

  onClose(): void {}
}
