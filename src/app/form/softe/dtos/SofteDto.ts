export class SofteDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.description = viewModel.description;
      this.amount = viewModel.amount;
      this.issueDate = viewModel.issueDate;
      this.trailerId = viewModel.trailerId;
      this.trailerPlaque = viewModel.trailerPlaque;
      this.driverId = viewModel.driverId;
      this.driverName = viewModel.driverName;
    }
  }
  id: number;
  trailerId: number;
  trailerPlaque: string;
  driverId: number;
  driverName: string;
  description: string;
  amount: number;
  issueDate: string;
  phone: string;
  address: string;
}
