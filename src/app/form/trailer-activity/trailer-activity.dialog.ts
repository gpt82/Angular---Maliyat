// import { Component, Inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
// import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { HttpClient } from '@angular/common/http';
// import { ModalBaseClass } from '../../shared/services/modal-base-class';
// import { Router } from '@angular/router';
// import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
// import { Subject } from 'rxjs';
// import { InvoiceService } from '../invoice/invoice.service';

// @Component({
//   // tslint:disable-next-line: component-selector
//   selector: 'trailer-activity-dialog',
//   templateUrl: 'trailer-activity.dialog.html',

// })
// // tslint:disable-next-line: component-class-suffix
// export class TrailerActivityDialog extends ModalBaseClass implements OnInit, OnDestroy {

//   constructor(
//     public dialogRef: MatDialogRef<TrailerActivityDialog>,
//     @Inject(MAT_DIALOG_DATA) public data: any,
//     public dialog: MatDialog,
//     public invoiceService: InvoiceService
//   ) {
//     super();
//   }

//   ngOnInit() {
//     this.invoiceService.isInvoice = false;
//     this.invoiceService.loadTrailerItems(this.data.trailerId);
//   }

//   onClose(): void {
//     // if (this.formGroup != null && !this.formGroup.dirty) {
//     this.dialogRef.close({ data: null, state: 'cancel' });
//     if (!this.data.isEdit) {
//     }
//   }
//   onSave(): void {
//     // if (this.form.dirty && this.form.valid || this.invoiceService.ifFormChanged()) {
//     if (this.form.valid) {
//       if (this.data.isEdit === true) {
//         this.edit();
//       } else {
//         this.create();
//         this.data.isEdit = true;
//       }
//       // this.onClose();
//       // this.invoiceService.idsOnEnter = this.invoiceService.allIds;
//     }
//   }

//   create() {

//   }

//   edit() {
//   }

//   onInvoicePrint(): void {
//     if (!this.data.isEdit || this.invoiceService.ifFormChanged()) {
//       // return;
//       const dialogRef = this.dialog.open(ConfirmDialog, {
//         width: '250px',
//         height: '150px',
//         data: { state: 'ok', messageText: 'ابتدا صورتحساب را ذخیره کنید ، مایلید ذخیره شود؟' }
//       });

//       dialogRef.afterClosed().subscribe(result => {
//         if (result.state === 'confirmed') {
//           this.onSave();
//           this.invoiceService.printPreviewInvoice(this.data.invoice.id);
//           dialogRef.close({ data: null, state: 'cancel' });
//           this.dialogRef.close({ state: 'successful' });
//         }
//       });
//     } else {
//       this.invoiceService.printPreviewInvoice(this.data.invoice.id);
//       this.dialogRef.close({ state: 'successful' });
//     }

//   }
//   getUrl() {
//     return '/v1/api/Invoice/';
//   }
//   ngOnDestroy(): void {
//     this.invoiceService.invoiceAgenda = [];
//     this.invoiceService.invoiceAmani = [];
//     this.invoiceService.invoiceRecar = [];
//     this.invoiceService.invoiceSubsidy = [];
//     this.invoiceService.invoiceHavale = [];
//     this.invoiceService.invoicePenalty = [];
//     this.invoiceService.invoiceChaque = [];
//     this.invoiceService.invoiceKaf = [];
//     this.invoiceService.invoiceAccessory = [];
//     this.invoiceService.invoiceFactor = [];
//   }
// }
