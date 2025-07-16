import {
  Component,
  Inject,
  ElementRef,
  ViewChild,
  OnInit
} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CarLookupDialog } from '../lookups/car/car-lookup.dialog';
import { FormControl, FormGroup } from '@angular/forms';

import { GridBaseClass } from '../../shared/services/grid-base-class';

import { CarDialog } from '../car/car.dialog';
import * as moment from 'jalali-moment';
import { CarDetailDto } from '../car/dtos/CarDetailDto';
import { AuthService } from '../../core/services/app-auth-n.service';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'add-car-to-agenda-dialog',
  templateUrl: 'add-car-to-agenda.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class AgendaCarToAgendaDialog extends GridBaseClass implements OnInit {
  @ViewChild('gridAgent')
  gridAgent: ElementRef;
  isEdit = false;
  carTypeList: any;
  bodyNum: string;
  agentForm: FormGroup;
  carDto: CarDetailDto;
  constructor(
    public dialogRef: MatDialogRef<AgendaCarToAgendaDialog>,
    public dialog: MatDialog,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public authService: AuthService
  ) {
    super(http, '/v1/api/Agenda/' + data.agendaId + '/Cars', dialog);
    this.fillGrid();
  }
  carWasAddedSubscriber($event) {
    this.fillGrid();
  }
  fillGrid(): void {
    this.applyGridFilters();
    this.view = this.service;
  }

  getUrl(): string {
    return '/v1/api/Agenda/' + this.data.agendaId + '/Cars';
  }

  addCar(bodyNumber: any): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .post(
        '/v1/api/Agenda/' + this.data.agendaId + '/Cars',
        JSON.stringify({
          AgendaId: this.data.agendaId,
          BodyNumber: bodyNumber
        }),
        { headers: headers1 }
      )
      .subscribe(result => {
        if (result['succeeded'] === true) {
          this.fillGrid();
        }
      });
  }

  RemoveCar(entity): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .put('/v1/api/car/clean/' + entity.carId, { headers: headers1 })
      .subscribe(result => {
        if (result['succeeded'] === true) {
          this.fillGrid();
        }
      });
  }

  onEditCar(data): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .get('/v1/api/car/' + data.carId, { headers: headers1 })
      .subscribe(result => {
        const car = new CarDetailDto(result['entity']);
        const dialogRef = this.dialog.open(CarDialog, {
          width: '600px',
          height: '520px',
          disableClose: true,
          data: {
            Car: car,
            datePcarickerConfig: {
              drops: 'down',
              format: 'YY/M/D',
              showGoToCurrent: 'true'
            },
            registeredDate: car.registeredDate
              ? moment(car.registeredDate).locale('fa')
              : moment().locale('fa'),
            dialogTitle: 'ویرایش سواری',
            isEdit: true
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result && result.state === 'successful') {
            this.fillGrid();
          }
        });
      });
  }
  onDeleteById(id): void {
    this.deleteEntity(id, '/v1/api/Car/');
  }
  onSave() { }

  onCreate(): void { }

  onEdit(data): void { }
  onCarLookup() {
    const title = ' لیست سواریها';
    const dialogRef = this.dialog.open(CarLookupDialog, {
      width: '60%',
      height: '740px',
      disableClose: true,
      data: {
        selectedItem: null,
        dialogTitle: title
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.bodyNum = result.data.selectedItem.bodyNumber;
    });
  }

  ngOnInit(): void {
    this.agentForm = new FormGroup({
      agentGrid: new FormControl(null)
    });
  }
  onClose(): void {
    const obj = {
      showReport: false
    };

    this.dialogRef.close(obj);
  }
  showAgendaCarsReport(): void {
    const obj = {
      showReport: true
    };
    this.dialogRef.close(obj);
  }
}
