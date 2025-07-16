export class ConsumerItemDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel != undefined) {
      this.name = viewModel.name;
      this.id = viewModel.id;
      this.number = viewModel.number;
    }
  }
  name: string;
  id: number;
  number: string;
}
