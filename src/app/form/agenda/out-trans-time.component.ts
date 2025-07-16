import { Component, OnInit, ViewChild } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { ReportService } from '../../shared/services/report-service';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { AuthService } from '../../core/services/app-auth-n.service';
import { Subject } from 'rxjs';
import { InvoiceService } from '../invoice/invoice.service';
import { AgendaService } from './agenda.service';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { OutTransTimeDialog } from './out-trans-time.dialog';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'out-trans-time-component',
  templateUrl: './out-trans-time.component.html',
  styles: [
    `
      .k-grid tr.even {
        background-color: #f45c42;
      }
      .k-grid tr.odd {
        background-color: #41f4df;
      }
    `
  ],
  providers: [HttpClient]
})
export class OutTransTimeComponent extends GridBaseClass implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(TooltipDirective)
  public tooltipDir: TooltipDirective;
  isEdit = false;
  public branches: any[];
  constructor(
    public dialog: MatDialog,
    private router: Router,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    public authService: AuthService,
    public agendaService: AgendaService,
    public sb: MatSnackBar
  ) {
    super(http, '/v1/api/Agenda/outTrans', dialog);
    this.gridName = 'outtransGrid';
    // this.dispatch();
    const gridSettings: State = this.getState();
    // authService.getUserBranchId().subscribe(result => (this.branchId = result));
    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
    this.resetSelectedRowIds();
  }

  public showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;
    if (
      (element.nodeName === 'TD' || element.nodeName === 'TH') &&
      element.offsetWidth < element.scrollWidth
    ) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }
  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }
  ngOnInit() {
    this.getLookups();
  }
  getLookups(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branches = result));
  }
  onCreate(): void {
  }
  onEdit(data: any): void {
    const dialogRef = this.dialog.open(OutTransTimeDialog, {
      width: '500px',
      height: '250px',
      disableClose: true,
      data: {
        agendaId: data.agendaId,
        Sentence: {
          description: data.description,
          id: data.id
        },
        dialogTitle: 'ویرایش',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        const header = new HttpHeaders({ 'Content-Type': 'application/json' });
        this.http.put(this.getUrl() + '/' + data.id,
          JSON.stringify(result.description), { headers: header }
        )
          .subscribe(() => {
            this.fillGrid();
            this.resetSelectedRowIds();
          });
      }
    });
  }
  onListReport(): void {
    const url = '/v1/api/Report/outTrans/';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        BranchName: result['branchName'],
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
          AgendaNumber: row.agendaNumber,
          ExportDate: moment(row.exportDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          ConfirmationTime: moment(row.confirmationTime)
            .locale('fa')
            .format('YYYY/MM/DD'),
          ReceiverCity: row.receiverCity + ' ' + row.receiverCode,
          ReceiverCode: row.receiverCode,
          DriverFullName: row.driverFullName,
          TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
          Description: row.description,
          BranchName: row.branchName,
          DiffTime: row.diffTime,
          TransTime: row.transTime
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'OutTransTime - Copy.mrt',
        options: null,
        dataSources,
        reportTitle: 'صورتحساب مالی رانندگان '
      });

      this.router.navigate(['form/report']);
    });
  }
  getUrl(): string {
    return '/v1/api/Agenda/outTrans';
  }
  onClose(): void {
  }
}
