import * as moment from 'jalali-moment';
export class WarrantyDetailDto {
  constructor(warrentyViewModel) {
    // this.isActive = true;
    if (warrentyViewModel != null && warrentyViewModel !== undefined) {
      this.id = warrentyViewModel.id;
      this.warrantyNumber = warrentyViewModel.warrantyNumber;
      this.issueDate = warrentyViewModel.issueDate;
      this.trailerId = warrentyViewModel.trailerId;
      this.trailerPlaque = warrentyViewModel.trailerPlaque;
      this.personTypeId = warrentyViewModel.personTypeId;
      this.personName = warrentyViewModel.personName;
      this.warrantyTypeId = warrentyViewModel.warrantyTypeId;
      this.amount = warrentyViewModel.amount;
      this.description = warrentyViewModel.description;
      this.isConfirmed = warrentyViewModel.isConfirmed;
    }
  }
  id: number;
  warrantyNumber: string;
  issueDate = moment().locale('fa');
  trailerId: number;
  trailerPlaque: string;
  personTypeId: number;
  personName: string;
  warrantyTypeId: number;
  amount = 0;
  description: string;
  isConfirmed = false;


}
