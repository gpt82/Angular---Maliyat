export class TruckLoanDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.description = viewModel.description;
      this.loanAmount = viewModel.loanAmount;
      this.interestRate = viewModel.interestRate;
      this.monthlyPayment = viewModel.monthlyPayment;
      this.totalPayment = viewModel.totalPayment;
      this.loanDate = viewModel.loanDate;
      this.trailerId = viewModel.trailerId;
      this.loanTerm = viewModel.loanTerm;
      this.trailerPlaque = viewModel.trailerPlaque;
      // this.driverId = viewModel.driverId;
      this.borrower = viewModel.borrower;
    }
  }
  id: number;
  trailerId: number;
  loanTerm: number;
  interestRate: number;
  monthlyPayment: number;
  totalPayment: number;
  trailerPlaque: string;
  // driverId: number;
  borrower: string;
  description: string;
  loanAmount: number;
  loanDate: string;
}
