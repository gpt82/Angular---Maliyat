import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { BranchDto } from '../branch/dtos/BranchDto';
import { DualViewModelDto } from '../../shared/dtos/DualViewModelDto';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'contact-dialog',
  templateUrl: 'contact.dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class ContactDialog extends ModalBaseClass implements OnInit {
  branchs = [];
  branchControl = new FormControl();
  form: FormGroup;
  branchFilterOptions: Observable<BranchDto[]>;
  branchDto = new DualViewModelDto(
    this.data.Person.branch ? this.data.Person.branch.id : null,
    this.data.Person.branch ? this.data.Person.branch.title : null
  );

  constructor(
    public dialogRef: MatDialogRef<ContactDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    super();
  }
  ngOnInit() {
    this.CreateForm();
    this.getBranchs();
  }

  CreateForm() {
    this.form = this.fb.group({
      branchId: this.data.Person.branchId,
      name: this.data.Person.name,
      family: this.data.Person.family,
      address: this.data.Person.address,
      zipCode: this.data.Person.zipCode,
      nationalCode: this.data.Person.nationalCode,
      mobile: this.data.Person.mobile
    });
  }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }
  // onBranchSelectionChange(event, branch: BranchDto): void {
  //   if (event && !event.isUserInput) return;
  //   this.data.Person.branch = new DualViewModelDto(branch.id, branch.name);
  //   this.branchDto.title = this.data.Person.branch.title;
  //   this.branchDto.id = this.data.Person.branch.id;
  // }

  // fillAllBranch(): void {
  //   this.http.get('/v1/api/Branch').subscribe(result => {
  //     this.branchs = result['entityLinkModels'];

  //     this.branchFilterOptions = this.branchControl.valueChanges.pipe(
  //       startWith<string | BranchDto>(''),
  //       map(value => (typeof value === 'string' ? value : value.name)),
  //       map(name => (name ? this.filterBranch(name) : this.branchs.slice()))
  //     );
  //   });
  // }
  // filterBranch(name: string): BranchDto[] {
  //   return this.branchs.filter(
  //     option =>
  //       option.entity.name.toLowerCase().indexOf(name.toLowerCase()) === 0
  //   );
  // }

  // fixAutoRelationalFields(type: string): void {
  //   if (type === 'branch') {
  //     if (
  //       this.data.Branch.branch == null ||
  //       this.data.Branch.branch === undefined
  //     ) {
  //       this.branchDto.title = '';
  //     } else if (
  //       this.branchDto.title !== this.data.Branch.branch.title &&
  //       this.branchDto.id === this.data.Branch.branch.id
  //     ) {
  //       this.data.Branch.branch = null;
  //       this.branchDto.title = null;
  //     }
  //   }
  // }

  getPersonPOJO(data) {
    return {
      // Code: data.Person.code,
      Name: this.form.get('name').value,
      Address: this.form.get('address').value,
      Family: this.form.get('family').value,
      NationalCode: this.form.get('nationalCode').value,
      ZipCode: this.form.get('zipCode').value,
      // Tel: this.form.get('tel').value,
      Mobile: this.form.get('mobile').value,
      BranchId: this.form.get('branchId').value
    };
  }
  onEd() {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .post(
        '/v1/api/Account/',
        JSON.stringify({
          userId: '436e1995-feed-4aed-117f-08d5ef910345',
          userName: 'test',
          name: 'Ali',
          family: 'amiri'
        }),
        { headers: headers1 }
      ).subscribe(
        result => {
          console.log(result);
        },
        (error: any) => {
          console.log('edit Person');
          console.log(error);
        }
      );
  }
  onSave(): void {
    if (this.form.valid) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });

      if (this.data.isEdit !== true) {
        this.http
          .post(
            this.getUrl(),
            JSON.stringify(this.getPersonPOJO(this.data)),
            { headers: headers1 }
          )
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit Person');
              console.log(error);
            }
          );
        ////////////////
      } else {
        this.http
          .put(this.getUrl() + this.data.Person.id, JSON.stringify(this.getPersonPOJO(this.data)), {
            headers: headers1
          })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('create Person');
              console.log(error);
            }
          );
      }
    }
  }

  onClose(): void {
    if (!this.form.dirty) { this.dialogRef.close({ data: null, state: 'cancel' }); } else {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '250px',
        data: { state: 'ok' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.state === 'confirmed') {
          this.dialogRef.close({ data: null, state: 'cancel' });
        }
      });
    }
  }

  // onBranchLookup(): void {
  //   let dialogRef = this.dialog.open(BranchLookup, {
  //     width: '700px',
  //     height: '600px',
  //     disableClose: true,
  //     data: {
  //       dialogTitle: 'انتخاب شعبه',
  //       selectedItem: null
  //     }
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result && result.data.selectedItem) {
  //       var branch = new BranchDto(null);
  //       branch.id = result.data.selectedItem.id;
  //       branch.name = result.data.selectedItem.name;

  //       this.onBranchSelectionChange(
  //         {
  //           isUserInput: true
  //         },
  //         branch
  //       );
  //     }
  //   });
  // }
  getUrl() {
    return '/v1/api/Person/';
  }
}
