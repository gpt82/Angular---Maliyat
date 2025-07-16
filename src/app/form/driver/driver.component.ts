import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DriverDialog } from './driver.dialog';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { DriverDetailDto } from './dtos/DriverDetailDto';
import { AuthService } from '../../core/services/app-auth-n.service';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'driver-component',
  templateUrl: './driver.component.html',
  providers: [HttpClient]
})
export class DriverComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  trailers: any[] = [];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/Driver/', dialog);
    this.gridName = 'driverGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  ngOnInit() {
    // this.getLookups();
  }

  //   getLookups() : void {
  //     this.http.get("/v1/api/Lookup/trailers").subscribe(result => this.trailers = Normalize(result));
  //   }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(DriverDialog, {
      width: '900px',
      height: '750px',
      disableClose: true,
      data: {
        Driver: new DriverDetailDto(null),
        dialogTitle: 'افزودن راننده جدید',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }

  onEdit(id: number): void {
    this.getEntity(id).subscribe(result => {
      const driver = new DriverDetailDto(result['entity']);

      const dialogRef = this.dialog.open(DriverDialog, {
        width: '900px',
        height: '750px',
        disableClose: true,
        data: {
          Driver: driver,
          dialogTitle: 'ویرایش راننده',
          isEdit: true
        }
      });
      dialogRef.afterClosed().subscribe(result2 => {
        if (result2 && result2.state === 'successful') {
          this.fillGrid();
        }
      });
    });
  }

  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/Driver/';
  }

  onClose(): void {}
}
