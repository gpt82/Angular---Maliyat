import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { KafRentPaidDialog } from './kaf-rent-paid.dialog';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { KafRentPaidDto } from './dtos/KafRentPaid';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
import { IntlService } from '@progress/kendo-angular-intl';
import { InvoiceService } from '../invoice/invoice.service';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'kaf-rent-paid-component',
  templateUrl: './kaf-rent-paid.component.html',
  providers: [HttpClient]
})
export class KafRentPaidComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  trailers: any[] = [];

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    private invoiceService: InvoiceService
  ) {
    super(http, '/v1/api/KafRentPaid/', dialog);
    this.gridName = 'kaf-rent-paidGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  ngOnInit() {
    // this.getLookups();
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(KafRentPaidDialog, {
      width: '600px',
      height: '380px',
      disableClose: true,
      data: {
        KafRentPaid: new KafRentPaidDto(null),
        dialogTitle: 'افزودن اجاره کفی جدید',
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
      const kafRentPaid = new KafRentPaidDto(result['entity']);

      const dialogRef = this.dialog.open(KafRentPaidDialog, {
        width: '600px',
        height: '380px',
        disableClose: true,
        data: {
          KafRentPaid: kafRentPaid,
          dialogTitle: 'ویرایش اجاره کف',
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

  onKafRentPaidsListReport(): void {
    const url = '/v1/api/Report/KafRentPaidsList/';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        BranchName: result['branchName'],
        CompanyName: result['companyName'],
        CarManufacturerName: result['carManufacturerName'],
        CarManufacturerGroupName: result['carManufacturerGroupName'],
        FromDate: '',
        // moment(result['fromDate'])
        //   .locale('fa')
        //   .format('YYYY/MM/DD'),
        ToDate: '',
        // moment(result['toDate'])
        //   .locale('fa')
        //   .format('YYYY/MM/DD'),
        Description: result['description'],
        Code: result['code'],
        Name: result['name']
      };
      const detailRows = [];
      result['details'].forEach(row => {
        detailRows.push({
          // IssueDate: moment(row.issueDate)
          //   .locale('fa')
          //   .format('YYYY/MM/DD'),
          DriverName: row.driverName,
          DriverAccNumber: row.driverAccNumber,
          TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
          Rent: row.rent,
          ForMonth: row.forMonth,
          TafsiliAccount: row.tafsiliAccount,
          TotalAccount: row.totalAccount,
          MoeenAccount: row.moeenAccount,
          Markaz: row.markaz,
          Project: row.project,
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'KafRentList.mrt',
        options: null,
        dataSources,
        reportTitle: 'کفهای اجاره ای '
      });

      this.router.navigate(['form/report']);
    });
  }
  onMaliReport(): void {
    const url = '/v1/api/Report/KafRentPaidsList/';
    let ReportTitle, AgendaNumberTitle;

    ReportTitle = 'گزارش مالی کف های اجاره ای';
    AgendaNumberTitle = '  بابت  اجاره کف ';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        BranchName: result['branchName'],
        CompanyName: result['companyName'],
        // FromDate: moment(result['fromDate'])
        //   .locale('fa')
        //   .format('YYYY/MM/DD'),
        // ToDate: moment(result['toDate'])
        //   .locale('fa')
        //   .format('YYYY/MM/DD'),
        Description: result['description'],
        PreFareTitle: 'بستانکار',
        Code: result['code'],
        Name: result['name'],
        ReportTitle: ReportTitle
      };

      const detailRows = [];
      result['details'].forEach(row => {
        detailRows.push({
          AgendaNumber: AgendaNumberTitle + row.trailerPlaque.replace('ایران', '-'),
          // BodyNumber: row.bodyNumber,
          ExportDate: 'اجاره ی ' + row.forMonth,
          // moment(row.issueDate)
          // .locale('fa')
          // .format('YYYY/MM/DD'),
          PreFare: row.rent,
          // Fare: row.Fare,
          TafsiliAccount: row.tafsiliAccount,
          TotalAccount: row.totalAccount,
          MoeenAccount: row.moeenAccount,
          Markaz: row.markaz,
          Project: row.project,

        });
      });
      const dataSources = JSON.stringify({
        Mali: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'Mali2.mrt',
        options: null,
        dataSources,
        reportTitle: 'گزارش مالی کف های اجاره ای'
      });

      this.router.navigate(['form/report']);
    });
  }
  onCopy(): void {

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        messageText: 'آیا مایل به کپی لیست زیر هستید؟'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.state === 'confirmed') {
        const url = this.getUrl() + 'copykafrent/';

        const headers = this.getGridFilterHeader();
        this.http.get(url, { headers: headers }).subscribe(result => {
          this.fillGrid();
        },
          (error: any) => {
            console.log('create chaque');
            console.log(error);
          })
      }
    });

  }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/KafRentPaid/';
  }

  onClose(): void { }
  onInvoicePrintPreview(id: number) {
    if (id > 0) {
      this.invoiceService.printPreviewInvoice(id);
    } else {
      alert('  تسویه نشده است.');
    }
  }
}
