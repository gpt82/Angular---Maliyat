import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {DailyOperationDialog} from './daily-operation.dialog';
import {DailyOperationDto} from './dtos/DailyOperationDto';
import {HttpClient} from '@angular/common/http';
import {GridBaseClass} from '../../shared/services/grid-base-class';
import {State} from "@progress/kendo-data-query";
import { AuthService } from '../../core/services/app-auth-n.service';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { ExcelExportEvent } from '@progress/kendo-angular-grid';

@Component({
  selector: 'daily-operation-component',
  templateUrl: './daily-operation.component.html',
  providers: [
    HttpClient
  ],


})
export class DailyOperationComponent extends GridBaseClass implements OnInit{
  isEdit = false;
  // gridData: any[]
  
  public branches: any[];
  public tonnageTypes: any[];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService) {
    super(http, "/v1/api/DailyOperation/", dialog);
    this.gridName = 'dailyOperationGrid'
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }
  ngOnInit() {
    this.getLookups();
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  getLookups(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branches = result));
    this.http
    .get('/v1/api/Lookup/tonnageTypes')
    .subscribe((result: ILookupResultDto[]) => (this.tonnageTypes = result));  
  }
  onCreate(): void {
    let dialogRef = this.dialog.open(DailyOperationDialog, {
      width: "600px",
      height: "450px",
      disableClose: true,
      data: {
        dailyOperation: new DailyOperationDto(null),
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
    let dailyOperation = new DailyOperationDto(data);

    let dialogRef = this.dialog.open(DailyOperationDialog, {
      width: "600px",
      height: "450px",
      disableClose: true,
      data: {
        dailyOperation: dailyOperation,
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
  exportToExcel(event: ExcelExportEvent): void {
    event.workbook.sheets[0].rows.forEach(row => {
      row.entity.branchId = row.entity.branchName; // اینجا مقدار branchName را با branchId جایگزین می‌کنیم
    });
  }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return "/v1/api/DailyOperation/";
  }

  onClose(): void {
  }
}

