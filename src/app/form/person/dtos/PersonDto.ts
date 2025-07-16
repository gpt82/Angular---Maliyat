import { DualViewModelDto } from "../../../shared/dtos/DualViewModelDto";

export class PersonDto {
  constructor(personViewModel) {
    // this.branch = new DualViewModelDto();
    if (personViewModel != null && personViewModel != undefined) {
      this.name = personViewModel.name;
      this.family = personViewModel.family;
      this.id = personViewModel.id;
      this.nationalCode = personViewModel.nationalCode;
      this.address = personViewModel.address;
      this.zipCode = personViewModel.zipCode;
      this.tel = personViewModel.tel;
      this.mobile = personViewModel.mobile;
      this.fullName = personViewModel.fullName;

      this.branchId = personViewModel.branch.id;
      this.branchTitle = personViewModel.branch.title;
    }
  }
  name: string;
  family: string;
  id: number;
  nationalCode: string;
  address: string;
  zipCode: string;
  tel: string;
  mobile: string;
  fullName: string;
  branchTitle: string;
  branchId: number;
}
