import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { HttpClient } from '@angular/common/http';
import { BankDto } from '../../bank/dtos/BankDto';
import { BankDialog } from '../../bank/bank.dialog';
import { GridBaseClass } from '../../../shared/services/grid-base-class';

@Component({
  selector: 'bank-lookup-component',
  templateUrl: './bank-lookup.dialog.html',
  providers: [
    HttpClient
  ],

})
export class BankLookup extends GridBaseClass {
  onEdit(data: any): void {
  }
  getUrl(): string {
    return "/v1/api/Bank/";
  }
  isEdit = false;
  constructor(
    public dialogRef: MatDialogRef<BankLookup>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {
    super(http, "/v1/api/Bank/",dialog);
    this.fillGrid();
  }
  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  onSelect(item): void {
    this.dialogRef.close({ data: { selectedItem: item } });
  }
  onCreate(): void {
    let dialogRef = this.dialog.open(BankDialog, {
      width: "400px",
      height: "365px",
      disableClose: true,
      data: {
        Bank: new BankDto(null),
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

