import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeliveryWaybillDialog } from './delivery-waybill.dialog';
import * as moment from 'jalali-moment';


import { DeliveryWaybillDto } from './dtos/DeliveryWaybillDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { State } from '@progress/kendo-data-query';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ILookupResultDto } from '../../shared/dtos/LookupResultDto';

@Component({
  selector: 'delivery-waybill-component',
  templateUrl: './delivery-waybill.component.html',
  providers: [
    HttpClient
  ],


})
export class DeliveryWaybillComponent extends GridBaseClass {
  isEdit = false;
  public branches: any[];
  constructor(
    public dialog: MatDialog,
    private http: HttpClient,
    public authService: AuthService) {
    super(http, '/v1/api/DeliveryWaybill/', dialog);
    this.gridName = 'deliveryWaybillGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
    this.getBranches();
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  getBranches() {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe((result: ILookupResultDto[]) => this.branches = result);
  }
  onCreate(): void {
    const currentDate = moment();
    const dialogRef = this.dialog.open(DeliveryWaybillDialog, {
      width: '400px',
      height: '600px',
      disableClose: true,
      data: {
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D',
          showGoToCurrent: 'true'
        },
        DeliveryWaybill: new DeliveryWaybillDto(null),
        dialogTitle: 'ایجاد',
        isEdit: false,
        deliveryDate: currentDate.locale('fa')
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }

  onEdit(data): void {
    const DeliveryWaybill = new DeliveryWaybillDto(data);

    const dialogRef = this.dialog.open(DeliveryWaybillDialog, {
      width: '400px',
      height: '600px',
      disableClose: true,
      data: {
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D',
          showGoToCurrent: 'true'
        },
        DeliveryWaybill: DeliveryWaybill,
        dialogTitle: 'ویرایش ',
        deliveryDate: moment(data.deliveryDate).locale('fa'),
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
    return '/v1/api/DeliveryWaybill/';
  }

  onClose(): void {
  }
}

