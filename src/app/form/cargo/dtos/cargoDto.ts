export class CargoDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel != undefined) {
      this.id = viewModel.id;
      this.agendaId = viewModel.agendaId;
      // this.branchId = viewModel.branchId;
      // this.branchTitle = viewModel.branchTitle;
      // this.description = viewModel.description;
      // this.amount = viewModel.amount;
      // this.payDate = viewModel.payDate;
      // this.personName = viewModel.personName;
      // this.billMonth = viewModel.billMonth;
      // this.phoneNo = viewModel.phoneNo;
    }
  }
  id: number;
  agendaId: number;
  // branchId: string;
  // branchTitle: string;
  // personName: string;
  // billMonth: string;
  // phoneNo: string;
  // amount: number;
  // payDate: string;
  // description: string;
}
