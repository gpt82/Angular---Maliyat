import {Component, Inject, OnInit} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CarTypeDialog } from '../../car-type/car-type.dialog';
import { CarTypeDto } from '../../car-type/dtos/CarTypeDto';
import { GridBaseClass } from '../../../shared/services/grid-base-class';

const Normalize = data => data
  .filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  selector: 'car-type-lookup-component',
  templateUrl: './car-type-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class CarTypeLookupComponent extends GridBaseClass implements OnInit{
  carGroups: any[] = [];
  onEdit(data: any): void {
  }
  getUrl(): string {
    return "/v1/api/CarType/";
  }
  constructor(

    public dialogRef: MatDialogRef<CarTypeLookupComponent>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, "/v1/api/CarType/",dialog);
    this.fillGrid();
  }
  ngOnInit(){
   // this.getLookups();
  }
  // getLookups() : void{
  //   this.http.get("/v1/api/Lookup/carGroups").subscribe(result => this.carGroups = Normalize(result));
  // }
  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  onSelect(item): void {
    this.dialogRef.close({ data: { selectedItem: item } });
  }
  onCreate(): void {
    let dialogRef = this.dialog.open(CarTypeDialog, {
      width: "400px",
      height: "365px",
      disableClose: true,
      data: {
        CarType: new CarTypeDto(null),
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

