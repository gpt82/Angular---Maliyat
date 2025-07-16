import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import {GridBaseClass} from "@shared/services/grid-base-class";
import { AgentLookup } from "../agent/agent-lookup.dialog";

import { CarDialog } from "../../car/car.dialog";
import { CarDetailDto } from '../../car/dtos/CarDetailDto';
import { GridBaseClass } from '../../../shared/services/grid-base-class';

@Component({
  selector: 'car-lookup-dialog',
  templateUrl: './car-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class CarLookupDialog extends GridBaseClass implements OnInit {
  isEdit = false;
  showShipped = false;
  agents: any[] = [];
  cities: any[] = [];
  provinces: any[] = [];
  constructor(public dialogRef: MatDialogRef<AgentLookup>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {
    super(http, "/v1/api/car/", dialog);
    this.fillGrid();
  }
  ngOnInit() {
    //  this.getLookups();
  }
  //   getLookups() : void{
  //     this.http.get("/v1/api/Lookup/agents").subscribe(result => this.agents = Normalize(result));
  //     this.http.get("/v1/api/Lookup/cities").subscribe(result => this.cities = Normalize(result));
  //     this.http.get("/v1/api/Lookup/provinces").subscribe(result => this.provinces = Normalize(result));
  //   }
  getRowClass({ dataItem, index }) {
    if (!dataItem) return '';

    return {
      'shipped': dataItem.entity.isSent,
      '': !dataItem.entity.isSent
    };
  }

  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }

  onSelect(item): void {
    this.dialogRef.close({ data: { selectedItem: item } });
  }
  onCreate(): void {
    var currentDate = moment();
    let car = new CarDetailDto(null);
    let dialogRef = this.dialog.open(CarDialog, {
      width: "600px",
      height: "570px",
      disableClose: true,
      data: {
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D',
          showGoToCurrent: 'true'
        },
        Car: car,
        registeredDate: currentDate.locale('fa'),
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
    let car = new CarDetailDto(data);
    let dialogRef = this.dialog.open(CarDialog, {
      width: "600px",
      height: "570px",
      disableClose: true,
      data: {
        Car: car,
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D',
          showGoToCurrent: 'true'
        },
        registeredDate: moment(car.registeredDate).locale('fa'),
        dialogTitle: 'ویرایش ',
        isEdit: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      let headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      if (result && result.state == 'successful') {
        this.fillGrid();
      }
    });
  }

  onDeleteById(id): void {
    // this.deleteEntity(id);
  }

  onClose(): void {
    this.dialogRef.close({ data: null });
  }

  getUrl() {
    return "/v1/api/Car/";
  }
}

