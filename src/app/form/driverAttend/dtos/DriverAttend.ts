import { DateTimePickerActiveTab } from '@progress/kendo-angular-dateinputs';
import * as moment from 'jalali-moment';
export class DriverAttendDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.branchId = viewModel.branchId;
      this.branchName = viewModel.branchName;
      this.agendaNumber = viewModel.agendaNumber;
      this.description = viewModel.description;
      this.desNotLoaded = viewModel.desNotLoaded;
      this.attendDate = viewModel.attendDate;
      this.needDate = viewModel.needDate;
      this.trailerId = viewModel.trailerId;
      this.trailerPlaque = viewModel.trailerPlaque;
      this.driverId = viewModel.driverId;
      this.driverName = viewModel.driverName;
    }
  }
  id: number;
  branchId: string;
  trailerId: number;
  trailerPlaque: string;
  driverId: number;
  driverName: string;
  branchName: string;
  description: string;
  desNotLoaded: string;
  agendaNumber: string;
  attendDate: Date= new Date();// = moment().locale('fa');
  needDate: Date= new Date(); //= moment().locale('fa');
  
}
