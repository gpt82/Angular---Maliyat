export class RecurrentCarDetailDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.bodyNumber = viewModel.bodyNumber;
      this.exportDate = viewModel.exportDate;
      this.senderId = viewModel.senderId;
      this.senderTitle = viewModel.senderTitle;
      this.receiverId = viewModel.receiverId;
      this.receiverTitle = viewModel.receiverTitle;
      this.driverId = viewModel.driverId;
      this.driverTitle = viewModel.driverTitle;
      this.trailerId = viewModel.trailerId;
      this.trailerTitle = viewModel.trailerTitle;
      this.guiltyDriverId = viewModel.guiltyDriverId;
      this.guiltyDriverTitle = viewModel.guiltyDriverTitle;
      this.guiltyTrailerId = viewModel.guiltyTrailerId;
      this.guiltyTrailerTitle = viewModel.guiltyTrailerTitle;
      this.carTypeId = viewModel.carTypeId;
      this.carTypeTitle = viewModel.carTypeTitle;
      this.fare = viewModel.fare;
      this.description = viewModel.description;
      this.branchId = viewModel.branchId;
      this.branchName = viewModel.branchName;
      this.issueLetterNo = viewModel.issueLetterNo;
      this.issueDate = viewModel.issueDate;
    }
  }

  id: number;
  bodyNumber: string;
  exportDate: string;
  senderId: number;
  senderTitle: string;
  receiverId: number;
  receiverTitle: string;
  driverId: number;
  driverTitle: string;
  trailerId: number;
  trailerTitle: string;
  guiltyDriverId: number;
  guiltyDriverTitle: string;
  guiltyTrailerId: number;
  guiltyTrailerTitle: string;
  carTypeId: number;
  carTypeTitle: string;
  fare: number;
  description: string;
  branchId: number;
  branchName: string;
  issueLetterNo: string;
  issueDate: string;
}
