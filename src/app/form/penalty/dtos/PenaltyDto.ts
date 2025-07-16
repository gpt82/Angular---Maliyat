export class PenaltyDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.branchId = viewModel.branchId;
      this.branchName = viewModel.branchName;
      this.description = viewModel.description;
      this.amount = viewModel.amount;
      this.issueDate = viewModel.issueDate;
      this.trailerId = viewModel.trailerId;
      this.trailerPlaque = viewModel.trailerPlaque;
      this.driverId = viewModel.driverId;
      this.driverName = viewModel.driverName;
      this.selectedItems = viewModel.selectedItems;
      this.selectedDsc = viewModel.selectedDsc;
    }
  }
  id: number;
  branchId: string;
  trailerId: number;
  trailerPlaque: string;
  driverId: number;
  driverName: string;
  branchName: string;
  description: string;
  amount: number;
  issueDate: string;
  phone: string;
  address: string;
  selectedItems: string;
  selectedDsc: string;
}
