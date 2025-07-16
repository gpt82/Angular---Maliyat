import {Component, Inject, OnInit} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { TrailerDialog } from '../../trailer/trailer.dialog';
import { GridBaseClass } from '../../../shared/services/grid-base-class';
import { TrailerDetailDto } from '../../trailer/dtos/TrailerDetailDto';

const Normalize = data => data
  .filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  selector: 'trailer-lookup-component',
  templateUrl: './trailer-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class TrailerLookup extends GridBaseClass implements OnInit{
  trailerBuilders : any[] = [];
  tonnageTypes : any[] = [];  getUrl(): string {
    return "/v1/api/Trailer/";
  }
  onEdit(data: any): void {
  }
  constructor(
    public dialogRef: MatDialogRef<TrailerLookup>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, "/v1/api/Trailer/",dialog);
    this.fillGrid();
  }
  ngOnInit(){
    //this.getLookups();
  }
  // getLookups() : void {
  //   this.http.get("/v1/api/Lookup/trailerBuilders").subscribe(result => this.trailerBuilders = Normalize(result));
  //   this.http.get("/v1/api/Lookup/tonnageTypes").subscribe(result => this.tonnageTypes = Normalize(result));
  // }
  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  onSelect(item): void {
    this.dialogRef.close({ data: { selectedItem: item } });
  }
  onCreate(): void {
    // var currentDate = moment();
    let dialogRef = this.dialog.open(TrailerDialog, {
      width: "600px",
      height: "600px",
      disableClose: true,
      data: {
        Trailer: new TrailerDetailDto(null),
        dialogTitle: 'ایجاد',
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D',
          showGoToCurrent: 'true'
        },
        // thirdPartyInsuranceDate: currentDate.locale('fa'),
        // techDiagnosisInsuranceDate: currentDate.locale('fa'),
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

