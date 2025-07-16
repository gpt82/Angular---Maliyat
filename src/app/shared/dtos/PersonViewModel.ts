export class PersonViewModel {

  Id: number;
  NationalCode: string;
  FullName: string;

  constructor(id = null, nationalCode = null, fullName = null) {
    this.Id = id;
    this.NationalCode = nationalCode;
    this.FullName = fullName;
  }


}

