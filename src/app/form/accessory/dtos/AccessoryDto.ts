export class AccessoryDto {
  constructor(viewModel){
    if (viewModel != null && viewModel != undefined) {
      this.name = viewModel.name;
      this.id = viewModel.id;
      this.amount = viewModel.amount;
    }
  }
  name: string;
  id: number;
  amount: number;
}
