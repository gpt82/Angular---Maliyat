import { Component, OnInit } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'jalali-moment';
// import { ChaqueDialog } from './chaque.dialog';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { ChaqueDetailDto } from './dtos/chaqueDetailDto';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
import { ChaqueDialog } from './chaque.dialog';
import { IntlService } from '@progress/kendo-angular-intl';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'chaque-component',
  templateUrl: './chaque.component.html',
  providers: [HttpClient]
})
export class ChaqueComponent extends GridBaseClass implements OnInit {
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
    super(http, '/v1/api/Chaque/', dialog);
    this.gridName = 'chaqueGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  ngOnInit() {
    this.getLookups();
  }

  getLookups(): void {
    this.http.get('/v1/api/Lookup/banks').subscribe((result: ILookupResultDto[]) => this.banks = result);
  }
  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(ChaqueDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        Chaque: new ChaqueDetailDto(null),
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
      const chaque = new ChaqueDetailDto(result['entity']);
      const dialogRef = this.dialog.open(ChaqueDialog, {
        width: '700px',
        height: '450px',
        disableClose: true,
        data: {
          Chaque: chaque,
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
  onChaqueListReport(): void {
    const url = '/v1/api/Report/ChaquesList/';

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
          ChaqueNumber: row.chaqueNumber,
          IssueDate: moment(row.issueDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          DueDate: moment(row.dueDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          DriverName: row.driverName,
          TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
          BankName: row.bankName,
          InvoiceNumber: row.invoiceNumber,
          Amount: row.amount,
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'ChaqueList.mrt',
        options: null,
        dataSources,
        reportTitle: 'صورتحساب مالی رانندگان '
      });

      this.router.navigate(['form/report']);
    });
  }
  getUrl() {
    return '/v1/api/Chaque/';
  }
  onClose(): void { }
}
