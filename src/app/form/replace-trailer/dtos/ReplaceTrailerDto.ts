export class ReplaceTrailerDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.agendaId = viewModel.agendaId;
      this.agendaNumber = viewModel.agendaNumber;
      this.description = viewModel.description;
      this.amount = viewModel.amount;
      this.preFare = viewModel.preFare;
      this.issueDate = viewModel.issueDate;
      this.trailerId = viewModel.trailerId;
      this.trailerPlaque = viewModel.trailerPlaque;
      this.driverId = viewModel.driverId;
      this.driverName = viewModel.driverName;
      this.alternateAgendaNo = viewModel.alternateAgendaNo;
    }
  }
  id: number;
  agendaId: string;
  agendaNumber: string;
  trailerId: number;
  trailerPlaque: string;
  driverId: number;
  driverName: string;
  description: string;
  amount: number;
  preFare: number;
  issueDate: string;
  phone: string;
  address: string;
  alternateAgendaNo: string;
}
