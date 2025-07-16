export class TrailerCertDetailDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.driverId = viewModel.driverId;
      this.driverTitle = viewModel.driverTitle;
      this.trailerId = viewModel.trailerId;
      this.trailerTitle = viewModel.trailerTitle;
      this.description = viewModel.description;
      this.issueDate = viewModel.issueDate;
      this.selectedCertItems = viewModel.selectedCertItems;
    }
  }

  id: number;
  driverId: number;
  driverTitle: string;
  trailerId: number;
  trailerTitle: string;
  description: string;
  issueDate: string;
  selectedCertItems: string;
}
