import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CargoDialog } from './cargo.dialog';
import * as moment from 'jalali-moment';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ReportService } from '../../shared/services/report-service';
import { IntlService } from '@progress/kendo-angular-intl';
import { CargoDto } from './dtos/cargoDto';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'cargo-component',
  templateUrl: './cargo.component.html',
  providers: [HttpClient]
})
export class CargoComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  trailers: any[] = [];

  public branchs: any[];

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/cargo/', dialog);
    this.gridName = 'cargoGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
    this.getBranchs();
  }

  ngOnInit() {
    // this.getLookups();
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  getBranchs(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => (this.branchs = result));
  }
  onCreate(): void {

    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .post('/v1/api/Cargo/',
        JSON.stringify({
           agendaId: 1
        }),
        { headers: headers1 }
      )
      .subscribe(
        result => {
          this.fillGrid();
        },
        (error: any) => {
          console.log('create cargo');
          console.log(error);
        }
      );


    // const dialogRef = this.dialog.open(CargoDialog, {
    //   width: '600px',
    //   height: '480px',
    //   disableClose: true,
    //   data: {
    //     Cargo: new CargoDto(null),
    //     dialogTitle: 'افزودن جدید',
    //     isEdit: false
    //   }
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result && result.state === 'successful') {
    //     this.fillGrid();
    //   }
    // });
  }

  onEdit(data): void {
    // this.getEntity(id).subscribe(result => {
    //   const cargo = new CargoDto(result['entity']);

      const dialogRef = this.dialog.open(CargoDialog, {
        width: '600px',
        height: '480px',
        disableClose: true,
        data: {
          Cargo: data,
          dialogTitle: 'تخصیص بازنامه ',
          isEdit: true
        }
      });
      dialogRef.afterClosed().subscribe(result2 => {
        if (result2 && result2.state === 'successful') {
          this.fillGrid();
        }
      });
    // });
  }
  onCargosListReport(): void {
    const url = '/v1/api/Report/CargosList/';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        BranchName: result['branchName'],
        CompanyName: result['companyName'],
        CarManufacturerName: result['carManufacturerName'],
        CarManufacturerGroupName: result['carManufacturerGroupName'],
        FromDate: moment(result['fromDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        ToDate: moment(result['toDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        Description: result['description'],
        Code: result['code'],
        Name: result['name']
      };
      const detailRows = [];
      result['details'].forEach(row => {
        detailRows.push({
          PayDate: moment(row.payDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          PersonName: row.personName,
          PhoneNo: row.phoneNo,
          BranchTitle: row.barnchTitle,
          Amount: row.amount,
          Description: row.description,
          ForMonth: row.forMonth,
          CargoNo: row.cargoNo
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'CargoList.mrt',
        options: null,
        dataSources,
        reportTitle: 'لیست قبوض '
      });

      this.router.navigate(['form/report']);
    });
  }
  onDeleteById(id): void {
    this.deleteEntity(id);
  }
  onConfirmCargo(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        messageText: 'تایید تنخواه جهت نهایی شدن و پرداخت.(دیگر قبض قابل ویرایش نخواهد بود)'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.state === 'confirmed') {
        const headers1 = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        this.http
          .put(
            this.getUrl() + 'confirm/' + id,
            JSON.stringify({
              State: 2
            }),
            { headers: headers1 }
          )
          .subscribe(() => {
            this.resetSelectedRowIds();
            this.fillGrid();
          });
      }
    });
  }
  onPayCargo(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        messageText: 'پرداخت قبض و نهایی شدن)'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.state === 'confirmed') {
        const headers1 = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        this.http
          .put(
            this.getUrl() + 'pay/' + id,
            JSON.stringify({
              State: 2
            }),
            { headers: headers1 }
          )
          .subscribe(() => {
            this.resetSelectedRowIds();
            this.fillGrid();
          });
      }
    });
  }
  getUrl() {
    return '/v1/api/Cargo/';
  }

  onClose(): void {}
}
