export class TrailerFareDto {
  constructor(fareViewModel) {
    if (fareViewModel != null && fareViewModel != undefined) {
      this.id = fareViewModel.id;
      this.branchId = fareViewModel.branchId;
      this.contractNo = fareViewModel.contractNo;
      this.cityName = fareViewModel.cityName;
      this.cityId = fareViewModel.cityId;
      this.tonnageTypeName = fareViewModel.tonnageTypeName;
      this.tonnageTypeId= fareViewModel.tonnageTypeId;
      this.senderName = fareViewModel.senderName;
      this.senderId= fareViewModel.senderId;
      this.fare = fareViewModel.fare;
    }
  }
  id: number;
  branchId: number;
  contractNo: string;
  cityName: string;
  cityId: number;
  tonnageTypeName: string;
  tonnageTypeId: number;
  senderName: string;
  senderId: number;
  fare: number;
}
