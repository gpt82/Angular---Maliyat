export class CarTypeDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.name = viewModel.name;
      this.id = viewModel.id;
      this.code = viewModel.code;
      this.groupName = viewModel.groupName;
      this.groupId = viewModel.groupId;
    }
  }
  name: string;
  id: number;
  code: string;
  groupName: string;
  groupId: number;
}
