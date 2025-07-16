export class GoodsDto {
  constructor(viewModel){
    if (viewModel != null && viewModel != undefined) {
      this.name = viewModel.name;
      this.id = viewModel.id;
      this.code = viewModel.code;
    }
  }
  name: string;
  id: number;
  code: string;
}
