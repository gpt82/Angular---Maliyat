import * as moment from 'jalali-moment';
export class KafDetailDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.code = viewModel.code;
      this.deliveryDate = viewModel.deliveryDate;
      this.endDate = viewModel.endDate;
      this.driverId = viewModel.driverId;
      this.driverFullName = viewModel.driverFullName;
      this.trailerId = viewModel.trailerId;
      this.trailerPlaque = viewModel.trailerPlaque;
      this.rent = viewModel.rent;
      this.description = viewModel.description;
      // this.tonnageTypeId = viewModel.tonnageTypeId;
      this.guaranteeAmount = viewModel.guaranteeAmount;
      this.numShipments = viewModel.numShipments;
      this.guaranteeTypeId = viewModel.guaranteeTypeId;
      this.isActive = viewModel.isActive;
    }
  }

  id: number;
  code: string;
  deliveryDate = moment().locale('fa');
  endDate: string;
  driverId: number;
  driverFullName: string;
  trailerId: number;
  trailerPlaque: string;
  rent = 0;
  description: string;
  // tonnageTypeId: number;
  guaranteeAmount=0;
  numShipments=0;
  guaranteeTypeId=1;
  isActive = true;
}
