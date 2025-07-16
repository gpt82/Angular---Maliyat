export class TankhahDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.tankhahNo = viewModel.tankhahNo;
      this.description = viewModel.description;
      this.amount = viewModel.amount;
      this.registeredDate = viewModel.registeredDate;
      this.personId = viewModel.personId;
      this.personTitle = viewModel.personTitle;
      this.issueLetterNo = viewModel.issueLetterNo;
      this.issueLetterDate = viewModel.issueLetterDate;
      this.isTankhah = viewModel.isTankhah;
    }
  }
  id: number;
  tankhahNo: string;
  description: string;
  amount: number;
  registeredDate: string;
  personId: number;
  personTitle: string;
  issueLetterNo: string;
  issueLetterDate: string;
  isTankhah: boolean = true;
}
