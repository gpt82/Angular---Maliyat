import { Component } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { GridService } from '../../shared/services/grid.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProvinceDialog } from './province.dialog';

import {
    GridDataResult,
    DataStateChangeEvent
} from '@progress/kendo-angular-grid';

import { Observable } from 'rxjs';
import { ProvinceDto } from './dtos/ProvinceDto';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
    selector: 'province-component',
    templateUrl: './province.component.html',
    providers: [
        HttpClient
    ],


})
export class ProvinceComponent extends GridBaseClass {

    isEdit = false;
    constructor(
        public dialog: MatDialog,
        private router: Router,
        private http: HttpClient,
        public authService: AuthService) {
        super(http, '/v1/api/Gis/province', dialog);
        this.fillGrid();
    }

    fillGrid() {
        this.applyGridFilters();
        this.view = this.service;
    }
    onCreate(): void {
        const dialogRef = this.dialog.open(ProvinceDialog, {
            width: '400px',
            height: '400px',
            disableClose: true,
            data: {
                Province: new ProvinceDto(null),
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
    onEdit(editData): void {
        const province = new ProvinceDto(editData);
        const dialogRef = this.dialog.open(ProvinceDialog, {
            disableClose: true,
            height: '400px',
            data: {
                Province: province,
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
        return '/v1/api/gis/';
    }
    onClose(): void {}
}

