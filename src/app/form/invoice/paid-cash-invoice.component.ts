import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'jalali-moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';
import { PaidCashInvoiceDialog } from './paid-cash-invoice.dialog';
import { InvoiceService } from './invoice.service';
import { InvoiceDto } from './dtos/InvoiceDto';
import { ChaqueDetailDto } from '../chaque/dtos/chaqueDetailDto';
import { ChaqueDialog } from '../chaque/chaque.dialog';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { IntlService } from '@progress/kendo-angular-intl';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'paid-cash-invoice',
  templateUrl: './paid-cash-invoice.component.html',
  providers: [
    HttpClient
  ],


})
export class PaidCashInvoiceComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  canEditConfirmed = false;

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    public invoiceService: InvoiceService) {
    super(http, '/v1/api/Invoice/', dialog);
    this.gridName = 'PaidCashInvoiceGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }
  ngOnInit() {
    this.canEdit();
    this.invoiceService.invoiceAgenda = [];
    this.invoiceService.invoiceAmani = [];
    this.invoiceService.invoiceAccessory = [];
    this.invoiceService.invoiceChaque = [];
    this.invoiceService.invoiceFactor = [];
    this.invoiceService.invoiceHavale = [];
    this.invoiceService.invoiceKaf = [];
    this.invoiceService.invoicePenalty = [];
    this.invoiceService.invoiceRecar = [];
    this.invoiceService.invoiceReplace = [];
    this.invoiceService.invoiceSofte = [];
    this.invoiceService.invoiceSubsidy = [];
  }
  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    this.invoiceService.isInvoice = true;
    const title = 'ایجادصورتحساب مالی';
    const currentDate = moment();
    const dialogRef = this.dialog.open(PaidCashInvoiceDialog, {
      width: '1100px',
      height: '700px',
      disableClose: true,
      data: {
        invoice: new InvoiceDto(null),
        dialogTitle: title,
        isNew: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // if (result.showReport) {
      //   // this.selectedRowIds = [];
      //   this.onAgendaCarsReport(data.id);
      // } else {
      this.fillGrid();
      // }
    });
  }

  onEdit(data): void {
    this.invoiceService.isInvoice = true;
    const title = ' ویرایش صورتحساب مالی';
    const dialogRef = this.dialog.open(PaidCashInvoiceDialog, {
      disableClose: true,
      width: '1100px',
      height: '700px',
      data: {
        invoice: new InvoiceDto(data),
        dialogTitle: title,
        isEdit: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // if (result && result.state === 'successful') {
      this.fillGrid();
      // }
    });

  }
  //
  canEdit() {
    this.canEditConfirmed = ['عظیمی', 'صادقی','ذوالنوری', 'میثم', 'ندرتی'].some(substring => this.authService.getFullName().includes(substring));
  }
  onInvoiceConfirmed(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        messageText: 'تایید صورتحساب جهت نهایی شدن و پرداخت.(دیگر صورتحساب قابل ویرایش نخواهد بود)'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.state === 'confirmed') {
        const headers1 = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        this.http
          .put(
            this.getUrl() + 'confirmed/' + this.selectedRowIds[0].entity.id,
            JSON.stringify({
              State: 2
            }),
            { headers: headers1 }
          )
          .subscribe(() => {
            this.resetSelectedRowIds();
            this.fillGrid();
          });
      }
    });
  }
  onPrint() {
    this.invoiceService.printPreviewInvoice(this.selectedRowIds[0].entity.id);
  }
  onBankPrint() {
    this.invoiceService.InvoiceBankprint(this.selectedRowIds[0].entity.id);
  }
  onTotalPrint() {
    this.invoiceService.totalPrint();
  }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/Invoice/';
  }

  onClose(): void {
  }
}

