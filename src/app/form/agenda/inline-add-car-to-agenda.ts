import {
  Component,
  Inject,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CarDialog, AddCar } from '../car/car.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';

import * as moment from 'jalali-moment';
import { CarDetailDto } from '../car/dtos/CarDetailDto';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'inline-add-car-to-agenda',
  templateUrl: 'inline-add-car-to-agenda.html'
})
// tslint:disable-next-line:component-class-suffix
export class InlineAddCarToAgenda extends ModalBaseClass implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CarDialog>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpClient: HttpClient,
    public authService: AuthService
  ) {
    super();
    this.initialAddCar();
  }
  @ViewChild('bodyNumber') inputEl: ElementRef;
  loadingLocationId;

  @Input()
  agendaId;
  @Input()
  car: any;
  addCar: AddCar;
  @Output()
  carWasAdded = new EventEmitter<string>();
  onSave() {
    //  if (this.form.valid) {
    const data = this.addCar.data;
    const initCar = <CarDetailDto>{
      bodyNumber: '',
      externalNumber: '',
      owner: data.Car.owner,
      agentId: -1,
      carTypeId: -1,
      entranceFromId: data.Car.entranceFromId,
      registeredDate:
        data.registeredDate != null
          ? moment.from(data.registeredDate, 'fa').format('YYYY/MM/DD')
          : moment().locale('fa'),
      descriptionOfSupply: data.Car.descriptionOfSupply,
      loadingLocationId: data.Car.loadingLocationId
    };
    if (data) {
      const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.httpClient
        .post(
          this.getEntryPintUrl() + '/' + this.agendaId,
          JSON.stringify({
            BodyNumber: data.Car.bodyNumber,
            ExternalNumber: data.Car.externalNumber,
            Plate1: data.Car.plate1,
            Plate2: data.Car.plate2,
            PlateChar: data.Car.plateChar,
            PlateIran: data.Car.plateIran,
            Owner: data.Car.owner,
            TargetAgentId: data.Car.agentId,
            DeliveryAgentId: data.Car.deliveryAgentId,
            CarTypeId: data.Car.carTypeId,
            RegisteredDate:
              data.registeredDate != null
                ? moment.from(data.registeredDate, 'fa').format('YYYY/MM/DD')
                : moment().locale('fa'),
            DescriptionOfSupply: data.Car.descriptionOfSupply,
            LoadingLocationId: data.Car.loadingLocationId,
            BranchId: this.authService.selectedBranchId
          }),
          { headers: headers1 }
        )
        .subscribe(
          result => {
            // this.initialAddCar();
            // this.form.reset();
            this.initialAddCar(initCar);
            this.carWasAdded.emit('CarWasAdded');
          },
          (error: any) => {
            console.log('create car');
            console.log(error);
          }
        );
    }
    this.inputEl.nativeElement.focus();
    //  }
  }
  getEntryPintUrl() {
    return '/v1/api/Car/AddToAgenda';
  }
  onClose() { }
  ngOnInit(): void { }
  initialAddCar(carDto: CarDetailDto = null): void {
    const currentDate = moment();
    this.addCar = new AddCar(
      this.dialog,
      {
        datePickerConfig: {
          // drops: "down",
          openOnClick: 'false',
          openOnFocus: 'false',
          format: 'YYYY/M/D',
          showGoToCurrent: 'true'
        },
        Car: new CarDetailDto(carDto),
        registeredDate: currentDate.locale('fa'),
        dialogTitle: 'ایجاد',
        isEdit: false
      },
      this.httpClient
    );
  }
  // keydown(event) {
  //   if (event.code == "Enter") this.stopPropagationEvent(event);
  // }
  @HostListener('keydown', ['$event'])
  public keydown(event: any): void {
    if (event.keyCode === 27) {
      this.onClose();
      this.stopPropagationEvent(event);
    } else if (event.code === 'F2') {
      this.onSave();
      this.stopPropagationEvent(event);
    } else if (event.keyCode === 13) {
      this.keytab(event);
      this.stopPropagationEvent(event);
    }
  }
  keytab(event) {
    const element = event.srcElement.nextElementSibling; // get the sibling element

    if (element == null) {
      // check if its null
      return;
    } else { element.focus(); } // focus if not null
  }
  stopPropagationEvent(event): void {
    event.preventDefault();
    event.stopPropagation();
  }
  hotkeys(event) {
    // if (event.code == "Enter") {
    //   this.stopPropagationEvent(event);
    // }
  }
}
