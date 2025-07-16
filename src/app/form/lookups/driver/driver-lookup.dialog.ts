import {Component, Inject, OnInit} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { HttpClient } from '@angular/common/http';
import { DriverDialog } from '../../driver/driver.dialog';
import { GridBaseClass } from '../../../shared/services/grid-base-class';
import {DriverDetailDto} from "../../driver/dtos/DriverDetailDto";

const Normalize = data => data
  .filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  selector: 'driver-lookup-component',
  templateUrl: './driver-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class DriverLookup extends GridBaseClass implements OnInit{
  trailers : any[] = [];
  getUrl(): string {
    return "/v1/api/Driver/";
  }
  onEdit(data: any): void {
  }
  constructor(
    public dialogRef: MatDialogRef<DriverLookup>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, "/v1/api/Driver/",dialog);
    this.fillGrid();
  }
  ngOnInit(){
    //this.getLookups();
  }
  // getLookups() : void {
  //   this.http.get("/v1/api/Lookup/trailers").subscribe(result => this.trailers = Normalize(result));
  // }
  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  onSelect(item): void {
    this.dialogRef.close({ data: { selectedItem: item } });
  }

  onCreate(): void {
    let dialogRef = this.dialog.open(DriverDialog, {
      width: "800px",
      height: "600px",
      disableClose: true,
      data: {
        Driver: new DriverDetailDto(null),
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
  onClose(): void {
    this.dialogRef.close({ data: null });
  }
}

