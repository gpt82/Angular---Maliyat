import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CarTypeDialog } from './car-type.dialog';

import { CarTypeDto } from './dtos/CarTypeDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  selector: "car-type-component",
  templateUrl: './car-type.component.html',
  providers: [HttpClient]
})
export class CarTypeComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  carGroups: any[] = [];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/CarType/', dialog);
    this.gridName = 'carTypeGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }
  ngOnInit() {
    // this.getLookups();
  }
  //   getLookups() : void{
  //     this.http.get("/v1/api/Lookup/carGroups").subscribe(result => this.carGroups = Normalize(result));
  //   }
  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(CarTypeDialog, {
      width: '400px',
      height: '400px',
      disableClose: true,
      data: {
        CarType: new CarTypeDto(null),
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
    const dialogRef = this.dialog.open(CarTypeDialog, {
      width: '400px',
      height: '400px',
      disableClose: true,
      data: {
        CarType: data,
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
    return '/v1/api/CarType/';
  }
  onClose(): void { }
}
