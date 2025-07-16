import {Component, Inject, OnInit} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AgentDialog } from '../../agent/agent.dialog';
import { GridBaseClass } from '../../../shared/services/grid-base-class';
import {AgentDetailDto} from "../../agent/dtos/AgentDetailDto";

const Normalize = data => data
  .filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  selector: 'agent-lookup-component',
  templateUrl: './agent-lookup.dialog.html',
  providers: [
    HttpClient
  ],

})
export class AgentLookup extends GridBaseClass  implements OnInit{
  onEdit(data: any): void {
  }
  getUrl(): string {
    return "/v1/api/Agent/";
  }
  isEdit = false;
  provinces: any[]=[] ;
  cities: any[]=[] ;
  constructor(
    public dialogRef: MatDialogRef<AgentLookup>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {
    super(http, "/v1/api/Agent/",dialog);
    this.fillGrid();
  }
  ngOnInit(){
    //this.getLookups();

  }

  // getLookups(): void {
  //   this.http.get("/v1/api/Lookup/cities").subscribe(result => this.cities = Normalize(result));
  //   this.http.get("/v1/api/Lookup/provinces").subscribe(result => this.provinces = Normalize(result));
  // }
  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onSelect(item): void {
    this.dialogRef.close({ data: { selectedItem: item } });
  }
  onCreate(): void {
    let dialogRef = this.dialog.open(AgentDialog, {
      width: "700px",
      height: "450px",
      disableClose: true,
      data: {
        Agent: new AgentDetailDto(null),
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

