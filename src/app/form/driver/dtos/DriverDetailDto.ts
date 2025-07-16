import { FileDto } from '@shared/dtos/FileDto';

export class Address {
  constructor(data: Address) {
    Object.assign(this, data);
  }
  cityId: number;
  street: string;
  byStreet: string;
  alley: string;
  no: string;
  postalCode: string;
  mobile: string;
  phone: string;
}
export class DriverDetailDto {
  constructor(driverViewModel) {
    if (driverViewModel != null && driverViewModel !== undefined) {
      this.id = driverViewModel.id;
      this.smartCardNumber = driverViewModel.smartCardNumber;
      this.licenseNumber = driverViewModel.licenseNumber;
      this.firstName = driverViewModel.firstName;
      this.lastName = driverViewModel.lastName;
      this.nationCardNumber = driverViewModel.nationCardNumber;
      this.accNumber = driverViewModel.accNumber;
      this.accOwner = driverViewModel.accOwner;
      this.accBankId = driverViewModel.accBankId;
      this.cityName = driverViewModel.cityName;
      this.isOwner = driverViewModel.isOwner;
      this.address = driverViewModel.address;
      this.trailerId = driverViewModel.trailerId;
      this.trailerPlaque = driverViewModel.trailerPlaque;
      this.tafsiliAccount = driverViewModel.tafsiliAccount;
      this.infringementDescription = driverViewModel.infringementDescription;
      this.hasInfringement = driverViewModel.hasInfringement;
    }
  }
  id: number;
  smartCardNumber: string;
  trailerId: number;
  trailerPlaque: string;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  nationCardNumber: string;
  isOwner: boolean = false;
  accNumber: string;
  accOwner: string;
  accBankId = 1;
  cityName: string;
  phone: string;
  address: Address;
  tafsiliAccount: string;
  image: FileDto;
  infringementDescription: string;
  hasInfringement: false;
}
