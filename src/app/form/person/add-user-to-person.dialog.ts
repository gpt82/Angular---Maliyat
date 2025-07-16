import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserDto } from './dtos/UserDto';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from '../../core/services/app-auth-n.service';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'add-user-to-person.dialog',
  templateUrl: 'add-user-to-person.dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class AddUserToPersonDialog extends ModalBaseClass implements OnInit {
  users = [];
  userControl = new FormControl();
  userFilterOptions: Observable<UserDto[]>;
  userDto;

  constructor(
    public dialogRef: MatDialogRef<AddUserToPersonDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public authService: AuthService
  ) {
    super();
  }

  ngOnInit() {
    this.userDto = new UserDto(this.data.user);
    // this.userDto.id = this.data.user.id;
    this.fillAllUsers();
  }
  filterUser(name: string): UserDto[] {
    return this.users.filter(
      option =>
        option.entity.userName.toLowerCase().indexOf(name.toLowerCase()) === 0
    );
  }

  fixAutoRelationalFields(type: string): void {
    if (type == 'user') {
      if (this.data.user == null || this.data.user == undefined) {
        this.userDto.userName = '';
      } else if (
        this.userDto.userName != this.data.user.userName &&
        this.userDto.id == this.data.user.id
      ) {
        this.data.user = null;
        this.userDto.userName = null;
      }
    }
  }
  onUserSelectionChange(event, user: UserDto): void {
    if (event && !event.isUserInput) return;
    this.data.user = user;
    this.userDto.userName = this.data.user.userName;
    this.userDto.id = this.data.user.id;
  }

  fillAllUsers(): void {
    this.http.get('/v1/api/Account/').subscribe(result => {
      this.users = result as [any];

      this.users.some((user, index, _arr) => {
        if (this.userDto.id === user.id) {
          this.userDto.userName = user.userName;
          return true;
        }
      });

      this.applyUserFilter();
    });
  }
  applyUserFilter(): void {
    this.userFilterOptions = this.userControl.valueChanges.pipe(
      startWith<string | UserDto>(''),
      map(value => (typeof value === 'string' ? value : value.userName)),
      map(name => (name ? this.filterUser(name) : this.users.slice()))
    );
  }

  onClose(): void {
    this.dialogRef.close({ data: null, state: 'cancel' });
  }
  onSave(): void {
    if (this.form.valid) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      // this.http
      //   .post(
      //     this.getUrl() + this.data.id,
      //     JSON.stringify({
      //       UserId: this.data.user.id
      //     }),
      //     { headers: headers1 }
      //   )
      //   .subscribe(
      //     result => {
      //       this.dialogRef.close({ state: 'successful' });
      //     },
      //     (error: any) => {
      //       console.log('set agent received date');
      //       console.log(error);
      //     }
      //   );
      // -----------------------------------------------------
      this.http
        .post(
          '/v1/api/Account/',
          JSON.stringify({
            // id: this.data.user.userId,
            // userName: this.data.user.userName,
            // firstName: this.data.user.name,
            // lastName: this.data.user.family,
            userId: this.userDto.userId,
            userName: this.userDto.userName,
            name: this.userDto.name,
            family: this.userDto.family,
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('set agent received date');
            console.log(error);
          }
        );
    }
  }

  getUrl() {
    return '/v1/api/Person/AddUser/';
  }
}
