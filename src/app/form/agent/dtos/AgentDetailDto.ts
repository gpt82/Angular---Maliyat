export class AgentDetailDto {
  constructor(agentViewModel) {
    // this.isActive = true;
    if (agentViewModel != null && agentViewModel != undefined) {
      this.id = agentViewModel.id;
      this.name = agentViewModel.name;
      this.address = agentViewModel.address;
      this.cityId = agentViewModel.cityId;
      this.cityName = agentViewModel.cityName;
      this.code = agentViewModel.code;
      this.phone = agentViewModel.phone;
      // this.provinceId = agentViewModel.provinceId;
      // this.description = agentViewModel.description;
      // this.provinceName = agentViewModel.provinceName;
      // this.isActive = agentViewModel.isActive;
    }
  }
  id: number;
  name: string;
  address: string;
  cityId: number;
  cityName : string;
  code: string;
  phone: string;
  // provinceId:number;
  // description: string;
  // isActive: boolean;
  // provinceName: string;


}
