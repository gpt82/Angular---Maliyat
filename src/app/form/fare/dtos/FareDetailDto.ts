export class FareDto {
  constructor(fareViewModel) {
    if (fareViewModel != null && fareViewModel != undefined) {
      this.id = fareViewModel.id;
      this.branchId = fareViewModel.branchId;
      this.contractNo = fareViewModel.contractNo;
      this.cityName = fareViewModel.cityName;
      this.cityId = fareViewModel.cityId;
      this.driverFare = fareViewModel.driverFare;
      this.factoryFare = fareViewModel.factoryFare;
      this.preFare = fareViewModel.preFare;
      this.fare6 = fareViewModel.fare6;
      this.fare8 = fareViewModel.fare8;
    }
  }
  id: number;
  branchId: number;
  contractNo: string;
  cityName: string;
  cityId: number;
  driverFare: number;
  factoryFare: number;
  preFare: number;
  fare6: number;
  fare8: number;
}
