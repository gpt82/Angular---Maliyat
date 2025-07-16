export class FactoryFareDto {
  constructor(fareViewModel) {
    if (fareViewModel != null && fareViewModel !== undefined) {
      this.id = fareViewModel.id;
      this.branchId = fareViewModel.branchId;
      this.contractNo = fareViewModel.contractNo;
      this.provinceName = fareViewModel.provinceName;
      this.provinceId = fareViewModel.provinceId;
      this.provinceFare = fareViewModel.provinceFare;
    }
  }
  id: number;
  branchId: number;
  contractNo: string;
  provinceName: string;
  provinceId: number;
  provinceFare: number;
}
