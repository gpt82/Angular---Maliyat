import { Component } from '@angular/core';
import { State } from '@progress/kendo-data-query';
import { GridService } from '../../shared/services/grid.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AppConsts } from '../../shared/constants/constants';
import * as moment from 'jalali-moment';

import {
    GridDataResult,
    DataStateChangeEvent
} from '@progress/kendo-angular-grid';

import { Observable } from 'rxjs';
import { GisDto } from './dtos/GisDto';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Component({
    selector: 'gis-component',
    templateUrl: './gis.component.html',
    providers: [
        HttpClient
    ],


})
export class GisComponent {
    nodes;
    options = { rtl: true};

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private http: HttpClient,
        private service: GridService) {
        this.getGisTreeList();
    }
    getGisTreeList(): void {
        this.http.get(this.getUrl()).subscribe((result) => {
            this.nodes = result;
        });
    }
    onCreate(): void {
    }
    go(event): void {

    }
    onEvent(evennt,node):void{

    }
    getUrl() {
        return  "/v1/api/Gis/";
    }
}

