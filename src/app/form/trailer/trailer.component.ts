import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TrailerDialog } from './trailer.dialog';
import * as moment from 'jalali-moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { TrailerDetailDto } from './dtos/TrailerDetailDto';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';
import { PaidCashInvoiceDialog } from '../invoice/paid-cash-invoice.dialog';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'trailer-component',
  templateUrl: './trailer.component.html',
  providers: [HttpClient]
})
export class TrailerComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  trailerBuilders: any[] = [];
  tonnageTypes: any[] = [];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/Trailer/', dialog);
    this.gridName = 'trailerGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  ngOnInit() {
    // this.getLookups();
  }

  //   getLookups() : void {
  //     this.http.get("/v1/api/Lookup/trailerBuilders").subscribe(result => this.trailerBuilders = Normalize(result));
  //     this.http.get("/v1/api/Lookup/tonnageTypes").subscribe(result => this.tonnageTypes = Normalize(result));
  //   }
  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }

  onCreate(): void {
    const currentDate = moment();
    const dialogRef = this.dialog.open(TrailerDialog, {
      width: '600px',
      height: '700px',
      disableClose: true,
      data: {
        Trailer: new TrailerDetailDto(null),
        dialogTitle: 'ایجاد',
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D',
          showGoToCurrent: 'true'
        },
        thirdPartyInsuranceDate: currentDate.locale('fa'),
        techDiagnosisInsuranceDate: currentDate.locale('fa'),
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }

  onEdit(id: number): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .get(`/v1/api/Trailer/${id}`, { headers: headers1 })
      .subscribe(result => {
        const trailer = new TrailerDetailDto(result['entity']);
        const dialogRef = this.dialog.open(TrailerDialog, {
          width: '600px',
          height: '700px',
          disableClose: true,
          data: {
            datePickerConfig: {
              drops: 'down',
              format: 'YY/M/D',
              showGoToCurrent: 'true'
            },
            Trailer: trailer,
            // thirdPartyInsuranceDate: moment(data.thirdPartyInsuranceDate).locale('fa'),
            // techDiagnosisInsuranceDate: moment(data.techDiagnosisInsuranceDate).locale('fa'),
            dialogTitle: 'ویرایش ',
            isEdit: true
          }
        });
        dialogRef.afterClosed().subscribe(result2 => {
          if (result2 && result2.state === 'successful') {
            this.fillGrid();
          }
        });
      });
  }

  onDeleteById(id): void {
    this.deleteEntity(id);
  }
  checkout(): void {
    const title = 'تسویه حساب تریلر';
    const dialogRef = this.dialog.open(PaidCashInvoiceDialog, {
      disableClose: true,
      width: '1100px',
      height: '700px',
      data: {
        trailerId: this.selectedRowIds[0].entity.id,
        invoice: {
          registeredDate: moment().locale('fa'),
          invoiceNumber: '',
          description: ''
        },
        dialogTitle: title,
        isEdit: false,
        isTrailerCheckout: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      // if (result && result.state === 'successful') {
      this.fillGrid();
      // }
    });

  }
  getUrl() {
    return '/v1/api/Trailer/';
  }

  onClose(): void { }
}
