export class DriverAccessoryDetailDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.driverId = viewModel.driverId;
      this.driverTitle = viewModel.driverTitle;
      this.trailerId = viewModel.trailerId;
      this.trailerTitle = viewModel.trailerTitle;
      this.description = viewModel.description;
      this.issueDate = viewModel.issueDate;
      this.selectedItems = viewModel.selectedItems;
      this.amount = viewModel.amount;
    }
  }

  id: number;
  driverId: number;
  driverTitle: string;
  trailerId: number;
  trailerTitle: string;
  description: string;
  issueDate: string;
  selectedItems: string;
  amount: number;
}
