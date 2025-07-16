
export class CarManufacturerGroupDto {
  constructor(cmg) {
    if (cmg != null && cmg != undefined) {
      this.id = cmg.id;
      this.name = cmg.name;
    }
  }
  name: string;
  id: number;
}
