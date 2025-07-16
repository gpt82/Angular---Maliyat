export class GeteFareDto {
  constructor(fareViewModel) {
    if (fareViewModel != null && fareViewModel != undefined) {
      this.id = fareViewModel.id;
      this.branchId = fareViewModel.branchId;
      this.geteSenderZoneId = fareViewModel.geteSenderZoneId;
      this.geteReceiverZoneId = fareViewModel.geteReceiverZoneId;
      this.contractNo = fareViewModel.contractNo;
      this.tonnageTypeId = fareViewModel.tonnageTypeId;      
      this.fare = fareViewModel.fare;
    }
  }
  id: number;
  branchId: number;
  geteSenderZoneId: number;
  geteReceiverZoneId: number;
  contractNo: string;
  tonnageTypeId: number;
  fare: number;
}
