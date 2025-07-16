import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { BranchDto } from './dtos/BranchDto';
import { BranchDialog } from './branch.dialog';
import { AuthService } from '../../core/services/app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';

@Component({
  selector: "branch-component",
  templateUrl: './branch.component.html',
  providers: [HttpClient],

})
export class BranchComponent extends GridBaseClass {
  isEdit = false;
  isSuperAdmin: boolean;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/Branch/', dialog);

    this.isSuperAdmin = this.authService.hasRole(
      RolesConstants.SuperAdministrators
    );
    if (this.isSuperAdmin) { this.fillGrid(); }
  }
  fillGrid() {
    super.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(BranchDialog, {
      width: '700px',
      height: '650px',
      disableClose: true,
      data: {
        Branch: new BranchDto(null),
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
    const branch = new BranchDto(data);

    const dialogRef = this.dialog.open(BranchDialog, {
      width: '550px',
      height: '690px',
      disableClose: true,
      data: {
        Branch: branch,
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
    return '/v1/api/Branch/';
  }
  onClose(): void { }
}
