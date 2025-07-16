import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { BankAccountDialog } from '../bank-account/bank-account.dialog';
import { BankAccountDto } from '../bank-account/dtos/BankAccountDto';

@Component({
  selector: 'person-bank-account',
  templateUrl: './person-bank-account.component.html',
  providers: [
    HttpClient
  ],

})
export class PersonBankAccountComponent extends GridBaseClass {

  isEdit = false;
  constructor(
    public dialogRef: MatDialogRef<PersonBankAccountComponent>,
    public dialog: MatDialog,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient) {
    super(http, "/v1/api/Person/" + data.personId + "/BankAccounts", dialog);
    this.fillGrid();
  }
  fillGrid(): void {
    this.applyGridFilters();
    this.view = this.service;
  }

  getUrl(): string {
    return "/v1/api/Person/" + this.data.personId + "/BankAccounts";
  }

  onCreate(): void {
    let dialogRef = this.dialog.open(BankAccountDialog, {
      width: "600px",
      height: "600px",
      disableClose: true,
      data: {
        PersonId: this.data.personId,
        BankAccount: new BankAccountDto(null),
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
    let bankAccount = new BankAccountDto(data);

    let dialogRef = this.dialog.open(BankAccountDialog, {
      width: "600px",
      height: "600px",
      disableClose: true,
      data: {
        PersonId: this.data.personId,
        BankAccount: bankAccount,
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

  onDeleteById(id): void {
    this.deleteEntity("/" + id);
  }

  onClose(): void {
    this.dialogRef.close({ data: null });
  }

}
