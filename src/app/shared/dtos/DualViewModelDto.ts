export class DualViewModelDto {
  constructor(id = null, title = null) {
    this.id = id;
    this.title = title;
  }
  title: string;
  id: number;
}
