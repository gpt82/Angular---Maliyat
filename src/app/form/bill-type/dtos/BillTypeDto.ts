export class BillTypeDto {
  constructor(viewModel){
    if (viewModel != null && viewModel != undefined) {
      this.name = viewModel.name;
      this.id = viewModel.id;
    }
  }
  name: string;
  id: number;
}
