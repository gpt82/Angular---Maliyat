export class PostDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.description = viewModel.description;
      this.registeredDate = viewModel.registeredDate;
      this.personId = viewModel.personId;
      this.personTitle = viewModel.personTitle;
    }
  }
  id: number;
  description: string;
  registeredDate: string;
  personId: number;
  personTitle: string;
}
