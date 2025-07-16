import {Component, Inject, OnInit} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CityDto } from '../../city/dtos/CityDto';
import { CityDialog } from '../../city/city.dialog';
import { GridBaseClass } from '../../../shared/services/grid-base-class';

const Normalize = data => data
  .filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  selector: 'city-lookup-component',
  templateUrl: './city-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class CityLookupComponent extends GridBaseClass implements OnInit{
  SearchText = "";
  provinces: any[] = [] ;
  getUrl(): string {
    return "/v1/api/GIS/Province/" + this.data.provinceId + "/Cities/";
  }
  onEdit(data: any): void {
  }
  constructor(
    public dialogRef: MatDialogRef<CityLookupComponent>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, "/v1/api/GIS/Province/" + data.provinceId + "/Cities", dialog);
    this.fillGrid();
  }
  ngOnInit(){
    //this.getLookups();
  }
  // getLookups() : void{
  //   this.http.get("/v1/api/Lookup/provinces").subscribe(result => this.provinces = Normalize(result));
  // }
  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  // filterByCity(e): void {
  //   if (e.keyCode == 13) {
  //     this.applyGridFilters(this.getUrl() + "/" + this.SearchText)
  //     this.view = this.service;
  //     this.stopPropagationEvent(e);
  //   }
  // }
  onSelect(item): void {
    this.dialogRef.close({ data: { selectedItem: item } });
  }
  onCreate(): void {
    let dialogRef = this.dialog.open(CityDialog, {
      width: "400px",
      height: "365px",
      disableClose: true,
      data: {
        City: new CityDto(null),
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

