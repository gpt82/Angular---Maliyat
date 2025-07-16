import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TrailerOwnerTypeDialog } from './trailer-owner-type.dialog';

import { TrailerOwnerTypeDto } from './dtos/TrailerOwnerTypeDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
    selector: 'trailer-owner-type-component',
    templateUrl: './trailer-owner-type.component.html',
    providers: [
        HttpClient
    ],


})
export class TrailerOwnerTypeComponent extends GridBaseClass {
    position = 'before';
    isEdit = false;
    constructor(
        public dialog: MatDialog,
        http: HttpClient,
        public authService: AuthService) {
        super(http, "/v1/api/TrailerOwnerType/",dialog);
        this.fillGrid();
    }

    fillGrid() {
        this.applyGridFilters();
        this.view = this.service;
    }
    onCreate(): void {

        let dialogRef = this.dialog.open(TrailerOwnerTypeDialog, {
            width: "400px",
            height: "250px",
            disableClose: true,
            data: {
                TrailerOwnerType: new TrailerOwnerTypeDto(),
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
        let dialogRef = this.dialog.open(TrailerOwnerTypeDialog, {
            width: "400px",
            height: "250px",
            disableClose: true,
            data: {
                TrailerOwnerType: data,
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
        return "/v1/api/TrailerOwnerType/";
    }
  onClose():void{}
}

