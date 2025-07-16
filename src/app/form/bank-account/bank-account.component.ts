import {Component} from '@angular/core';
import {Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {BankAccountDialog} from './bank-account.dialog';
import {BankAccountDto} from './dtos/BankAccountDto';
import {HttpClient} from '@angular/common/http';
import {GridBaseClass} from '../../shared/services/grid-base-class';
import {State} from "@progress/kendo-data-query";
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  selector: 'bank-account-component',
  templateUrl: './bank-account.component.html',
  providers: [
    HttpClient
  ],


})
export class BankAccountComponent extends GridBaseClass {
  isEdit = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService) {
    super(http, "/v1/api/BankAccount/", dialog);
    this.gridName = 'bankAccountGrid'
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    let dialogRef = this.dialog.open(BankAccountDialog, {
      width: "600px",
      height: "450px",
      disableClose: true,
      data: {
        bankAccount: new BankAccountDto(null),
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
      height: "450px",
      disableClose: true,
      data: {
        bankAccount: bankAccount,
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
    this.deleteEntity(id);
  }

  getUrl() {
    return "/v1/api/BankAccount/";
  }

  onClose(): void {
  }
}

