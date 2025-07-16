import * as moment from 'jalali-moment';
export class ChaqueDetailDto {
  constructor(chaqueViewModel) {
    // this.isActive = true;
    if (chaqueViewModel != null && chaqueViewModel !== undefined) {
      this.id = chaqueViewModel.id;
      this.chaqueNumber = chaqueViewModel.chaqueNumber;
      this.issueDate = chaqueViewModel.issueDate;
      this.dueDate = chaqueViewModel.dueDate;
      this.trailerId = chaqueViewModel.trailerId;
      this.trailerPlaque = chaqueViewModel.trailerPlaque;
      this.driverId = chaqueViewModel.driverId;
      this.driverName = chaqueViewModel.driverName;
      this.invoiceId = chaqueViewModel.invoiceId;
      this.invoiceNumber = chaqueViewModel.invoiceNumber;
      this.bankId = chaqueViewModel.bankId;
      this.bankName = chaqueViewModel.bankName;
      this.amount = chaqueViewModel.amount;
      this.description = chaqueViewModel.description;
      this.isConfirmed = chaqueViewModel.isConfirmed;
    }
  }
  id: number;
  chaqueNumber: string;
  issueDate = moment().locale('fa');
  dueDate = moment().locale('fa');   
  trailerId: number;
  trailerPlaque: string;
  driverId: number;
  driverName: string;
  invoiceId: number;
  invoiceNumber: string;
  bankId: number;
  bankName: string;
  amount = 0;
  description: string;
  isConfirmed = false;


}
