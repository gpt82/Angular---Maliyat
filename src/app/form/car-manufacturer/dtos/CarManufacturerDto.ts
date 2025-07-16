import { DualViewModelDto } from "../../../shared/dtos/DualViewModelDto";

export class CarManufacturerDto {
    constructor(cm) {
        this.group = new DualViewModelDto();
        if (cm != null && cm != undefined) {
            this.id = cm.id;
            this.name = cm.name;
            this.cityId = cm.cityId
            this.cityName = cm.cityName;

            this.group.id = cm.group.id;
            this.group.title = cm.group.title;
        }
    }
    name: string;
    cityName: string;
    group: DualViewModelDto;
    id: number;
    cityId: number;
}
