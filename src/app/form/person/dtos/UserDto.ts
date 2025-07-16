
export class UserDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
    this.userId = viewModel.userId;
    this.name = viewModel.name;
    this.family = viewModel.family;
    this.userName = 'ali';
  }
}
userId: string;
  name: string;
  family: string;
  userName: string;
}
