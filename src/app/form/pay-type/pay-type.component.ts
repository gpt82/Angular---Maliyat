import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PayTypeDialog } from './pay-type.dialog';
import { PayTypeDto } from './dtos/PayTypeDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
    selector: 'pay-type-component',
    templateUrl: './pay-type.component.html',
    providers: [
        HttpClient
    ],


})
export class PayTypeComponent extends GridBaseClass {
    isEdit = false;

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private http: HttpClient,
        public authService: AuthService) {
        super(http, '/v1/api/PayType/', dialog);
        this.fillGrid();
    }

    fillGrid() {
        this.applyGridFilters();
        this.view = this.service;
    }
    onCreate(): void {
        const dialogRef = this.dialog.open(PayTypeDialog, {
            width: '400px',
            height: '365px',
            disableClose: true,
            data: {
                PayType: new PayTypeDto(),
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
        const dialogRef = this.dialog.open(PayTypeDialog, {
            width: '400px',
            height: '365px',
            disableClose: true,
            data: {
                PayType: data,
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

    onDeleteById(id): void {
       this.deleteEntity(id);
    }

    getUrl() {
        return '/v1/api/PayType/';
    }
  onClose(): void {}
}

