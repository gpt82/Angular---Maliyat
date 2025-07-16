export class InvalidAgendaDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel != undefined) {
      this.id = viewModel.id;
      // this.branchId = viewModel.branchId;
      // this.branchName = viewModel.branchName;
      this.description = viewModel.description;
      this.agendaNumber = viewModel.agendaNumber;
      this.issueDate = viewModel.issueDate;
      this.trailerId = viewModel.trailerId;
      this.trailerPlaque = viewModel.trailerPlaque;
      this.driverId = viewModel.driverId;
      this.driverName = viewModel.driverName;
    }
  }
  id: number;
  // branchId: string;
  trailerId: number;
  trailerPlaque: string;
  driverId: number;
  driverName: string;
  // branchName: string;
  description: string;
  agendaNumber: number;
  issueDate: string;
  phone: string;
  address: string;
}
