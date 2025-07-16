export class KafRentPaidDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.kafId = viewModel.kafId;
      this.kafCode = viewModel.kafCode;
      this.forMonth = viewModel.forMonth;
      this.rent = viewModel.rent;
      this.trailerId = viewModel.trailerId;
      this.trailerPlaque = viewModel.trailerPlaque;
      // this.driverId = viewModel.driverId;
      this.driverName = viewModel.driverName;
    }
  }
  id: number;
  kafId: number;
  kafCode: string;
  trailerId: number;
  trailerPlaque: string;
  // driverId: number;
  driverName: string;
  rent: number;
  forMonth: string;
}
