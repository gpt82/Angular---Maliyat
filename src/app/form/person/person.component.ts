import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PersonDto } from './dtos/PersonDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { PersonBankAccountComponent } from '../person-bank-account/person-bank-account.component';
import { AddUserToPersonDialog } from './add-user-to-person.dialog';
import { UserDto } from './dtos/UserDto';
import { ContactDialog } from './contact.dialog';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'Person-component',
  templateUrl: './person.component.html',
  providers: [HttpClient]
})
export class PersonComponent extends GridBaseClass {
  isEdit = false;
  isSuperAdmin: boolean;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {
    super(http, '/v1/api/Person/', dialog);
    this.fillGrid();
    this.isSuperAdmin = this.authService.hasRole(
      RolesConstants.SuperAdministrators
    );
  }
  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }
  onListBankAccount(entity): void {
    const title = ' حساب های بانکی ';
    const dialogRef = this.dialog.open(PersonBankAccountComponent, {
      width: '900px',
      height: '740px',
      disableClose: true,
      data: {
        personId: entity.id,
        dialogTitle: title + ' ' + entity.name + ' ' + entity.family
      }
    });
    dialogRef.afterClosed().subscribe(result => {});
  }
  onCreate(): void {
    const dialogRef = this.dialog.open(ContactDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        Person: new PersonDto(null),
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

  onEdit(data): void {
    const Person = new PersonDto(data);

    const dialogRef = this.dialog.open(ContactDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        Person: Person,
        dialogTitle: 'ویرایش ',
        isEdit: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }
  onAddUser(): void {
    const userData = this.selectedRowIds[0].entity;
    if (userData == null) { return; }
    const user = new UserDto(userData);
    // user.id = data.userId;
    const dialogRef = this.dialog.open(AddUserToPersonDialog, {
      width: '300px',
      height: '410px',
      disableClose: true,
      data: {
        user: user,
        id: userData.id,
        dialogTitle: 'افزودن کاربر به شخص'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/Person/';
  }
  onClose(): void {}
}
