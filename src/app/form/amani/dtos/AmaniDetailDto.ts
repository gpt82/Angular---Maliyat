export class AmaniDetailDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.bodyNumber = viewModel.bodyNumber;
      this.exportDate = viewModel.exportDate;
      this.senderId = viewModel.senderId;
      this.senderTitle = viewModel.senderTitle;
      this.receiverId = viewModel.receiverId;
      this.receiverTitle = viewModel.receiverTitle;
      this.agendaId = viewModel.agendaId;
      this.agendaTitle = viewModel.agendaTitle;
      this.receiverTitle = viewModel.receiverTitle;
      this.driverId = viewModel.driverId;
      this.driverTitle = viewModel.driverTitle;
      this.guiltyDriverId = viewModel.guiltyDriverId;
      this.guiltyDriverTitle = viewModel.guiltyTrailerTitle;
      this.guiltyTrailerId = viewModel.guiltyTrailerId;
      this.guiltyTrailerTitle = viewModel.guiltyTrailerTitle;
      this.trailerId = viewModel.trailerId;
      this.trailerTitle = viewModel.trailerTitle;
      this.carTypeId = viewModel.carTypeId;
      this.carTypeTitle = viewModel.carTypeTitle;
      this.fare = viewModel.fare;
      this.sixth1 = viewModel.sixth1;
      this.description = viewModel.description;
      this.branchId = viewModel.branchId;
      this.branchName = viewModel.branchName;
      this.issueLetterNo = viewModel.issueLetterNo;
      this.issueDate = viewModel.issueDate;
      this.isGhabel30 = viewModel.isGhabel30;
    }
  }

  id: number;
  bodyNumber: string;
  exportDate: string;
  senderId: number;
  senderTitle: string;
  receiverId: number;
  receiverTitle: string;
  agendaId: number;
  agendaTitle: string;
  driverId: number;
  driverTitle: string;
  guiltyDriverId: number;
  guiltyDriverTitle: string;
  guiltyTrailerId: number;
  guiltyTrailerTitle: string;
  trailerId: number;
  trailerTitle: string;
  carTypeId: number;
  carTypeTitle: string;
  fare: number;
  sixth1: number;
  description: string;
  branchId: number;
  branchName: string;
  issueLetterNo: string;
  issueDate: string;
  isGhabel30: boolean;
}
