import { Component, OnInit } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'jalali-moment';
// import { WarrantyDialog } from './warranty.dialog';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { WarrantyDetailDto } from './dtos/warrantyDetailDto';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
import { WarrantyDialog } from './warranty.dialog';
import { IntlService } from '@progress/kendo-angular-intl';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'warranty-component',
  templateUrl: './warranty.component.html',
  providers: [HttpClient]
})
export class WarrantyComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  invoiceId: number;
  banks: any[] = [];

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/Warranty/', dialog);
    this.gridName = 'warrantyGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  ngOnInit() {
  }

  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(WarrantyDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        Warranty: new WarrantyDetailDto(null),
        InvoiceId: this.invoiceId,
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
      const warranty = new WarrantyDetailDto(result['entity']);
      const dialogRef = this.dialog.open(WarrantyDialog, {
        width: '700px',
        height: '450px',
        disableClose: true,
        data: {
          Warranty: warranty,
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
  onWarrantyListReport(): void {
    const url = this.getUrl() + 'WarrantiesList/';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        // BranchName: result['branchName'],
        CompanyName: result['companyName'],
        CarManufacturerName: result['carManufacturerName'],
        CarManufacturerGroupName: result['carManufacturerGroupName'],
        FromDate: moment(result['fromDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        ToDate: moment(result['toDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        Description: result['description'],
        Code: result['code'],
        Name: result['name']
      };
      // const branches = [];
      // result['branches'].forEach(row => {
      //   branches.push({
      //     BranchTitle: row.branchTitle,
      //     Count: row.count
      //   });
      // });
      const detailRows = [];
      result['details'].forEach(row => {
        detailRows.push({
          WarrantyNumber: row.warrantyNumber,
          IssueDate: moment(row.issueDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          DueDate: moment(row.dueDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          PersonName: row.personName,
          TrailerPlaque: row.trailerPlaque ? row.trailerPlaque.replace('ایران', '-') : '',
          Description: row.description,
          Amount: row.amount,
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'WarrantyList.mrt',
        options: null,
        dataSources,
        reportTitle: 'گزارش اسناد تضمینی '
      });

      this.router.navigate(['form/report']);
    });
  }
  getUrl() {
    return '/v1/api/Warranty/';
  }
  onClose(): void { }
}
