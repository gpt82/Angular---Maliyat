export class TrailerDetailDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel != undefined) {
      this.id = viewModel.id;
      this.smartCardNumber = viewModel.smartCardNumber;
      this.tafsiliAccount = viewModel.tafsiliAccount;
      this.ownerTypeId = viewModel.ownerTypeId;
      this.ownerTypeTitle = viewModel.ownerTypeTitle;
      this.tonnageTypeId = viewModel.tonnageTypeId;
      this.tonnageTypeTitle = viewModel.tonnageTypeTitle;
      this.builderId = viewModel.builderId;
      this.builderTitle = viewModel.builderTitle;
      this.plate1 = viewModel.plate1;
      this.plate2 = viewModel.plate2;
      this.plateChar = viewModel.plateChar;
      this.plateIran = viewModel.plateIran;
      this.infringementDescription = viewModel.infringementDescription;
      this.hasInfringement = viewModel.hasInfringement;
      this.isBorrowLoan = viewModel.isBorrowLoan;
      this.isKafi = viewModel.isKafi;
      this.insureExpirDate = viewModel.insureExpirDate;
      this.healthCardExpirDate = viewModel.healthCardExpirDate;
      this.companyLicenseExpirDate = viewModel.companyLicenseExpirDate
    }
  }
  id: number;
  smartCardNumber: string;
  tafsiliAccount: string;
  ownerTypeId: number;
  ownerTypeTitle: string;
  tonnageTypeId: number;
  tonnageTypeTitle: string;
  builderId: number;
  builderTitle: string;
  plate1: number;
  plate2: number;
  plateChar: string;
  plateIran: number;
  infringementDescription: string;
  hasInfringement: false;
  isBorrowLoan: false;
  isKafi: false;
  
  insureExpirDate: string;
  healthCardExpirDate: string;
  companyLicenseExpirDate: string;
}
