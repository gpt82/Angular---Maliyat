import { Component, OnInit } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AgentDialog } from './agent.dialog';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { AgentDetailDto } from './dtos/AgentDetailDto';
import { AuthService } from '../../core/services/app-auth-n.service';

const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'agent-component',
  templateUrl: './agent.component.html',
  providers: [HttpClient]
})
export class AgentComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  provinces: any[] = [];
  cities: any[] = [];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/Agent/', dialog);
    this.gridName = 'agentGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  ngOnInit() {
    // this.getLookups();
  }

  public onSelect({ dataItem, item }): void {
    // const index = this.gridData.indexOf(dataItem);
    if (item === 'Move Up') {
      this.onCreate();
    }
    // else if (index < this.gridData.length - 1) {
    //   this.swap(index, index + 1);
    // }
  }
  //   getLookups(): void {
  //     this.http.get("/v1/api/Lookup/cities").subscribe(result => this.cities = Normalize(result));
  //   this.http.get("/v1/api/Lookup/provinces").subscribe(result => this.provinces = Normalize(result));
  // }
  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(AgentDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        Agent: new AgentDetailDto(null),
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

  onEdit(id: number): void {
    this.getEntity(id).subscribe(result => {
      const agent = new AgentDetailDto(result['entity']);
      const dialogRef = this.dialog.open(AgentDialog, {
        width: '700px',
        height: '450px',
        disableClose: true,
        data: {
          Agent: agent,
          dialogTitle: 'ویرایش ',
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
    return '/v1/api/Agent/';
  }
  onClose(): void { }
}
