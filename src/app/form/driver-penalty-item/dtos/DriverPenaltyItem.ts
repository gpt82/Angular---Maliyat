
export class DriverPenaltyItemDto {
  constructor(viewwModel) {
    if (viewwModel != null && viewwModel !== undefined) {
      this.id = viewwModel.id;
      this.name = viewwModel.name;
    }
  }
  name: string;
  id: number;
}
