import { DualViewModelDto } from "../../../shared/dtos/DualViewModelDto";

export class ShippingCompnanyDto {
    constructor(shippingCoViewModel) {
        this.city = new DualViewModelDto();
        this.province = new DualViewModelDto();

        if (shippingCoViewModel != null && shippingCoViewModel != undefined) {
            this.address = shippingCoViewModel.address;
            this.bodyNumber = shippingCoViewModel.bodyNumber;
            this.economicCode = shippingCoViewModel.economicCode;
            this.fax = shippingCoViewModel.fax;
            this.id = shippingCoViewModel.id;
            this.manager = shippingCoViewModel.manager;
            this.name = shippingCoViewModel.name;
            this.phone = shippingCoViewModel.phone;
            
            this.province.id = shippingCoViewModel.provinceId;
            this.province.title = shippingCoViewModel.provinceName;

            this.city.id = shippingCoViewModel.cityId;
            this.city.title = shippingCoViewModel.cityName;
        }

    }
    id: number;
    bodyNumber: string;
    name: string;
    economicCode: string;
    manager: string;
    city: DualViewModelDto;
    province: DualViewModelDto;
    address: string;
    phone: string;
    fax: string;
}