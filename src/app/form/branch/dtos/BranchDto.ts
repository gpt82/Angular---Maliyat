import { DualViewModelDto } from "../../../shared/dtos/DualViewModelDto";

export class BranchDto {
  constructor(branchViewModel) {
    this.province = new DualViewModelDto();
    this.city = new DualViewModelDto();
    this.manufacturer = new DualViewModelDto();
    this.cmf = new DualViewModelDto();
    this.isActive = true;
    if (branchViewModel != null && branchViewModel != undefined) {
      this.id = branchViewModel.id;
      this.name = branchViewModel.name;
      this.code = branchViewModel.code;
      this.totalAccount = branchViewModel.totalAccount;
      this.moeenAccount = branchViewModel.moeenAccount;
      this.markaz = branchViewModel.markaz;
      this.project = branchViewModel.project;
      (this.manager = branchViewModel.manager),
        (this.phone1 = branchViewModel.phone1);
      this.phone2 = branchViewModel.phone2;
      this.address = branchViewModel.address;
      (this.fareContract = branchViewModel.fareContract),
        (this.description = branchViewModel.description);
      this.isDefault = branchViewModel.isDefault;
      this.isActive = branchViewModel.isActive;
      this.maxPreFare40 = branchViewModel.maxPreFare40;
      this.preFarePercent = branchViewModel.preFarePercent;
      this.rewardPercent = branchViewModel.rewardPercent;
      this.maxFare = branchViewModel.maxFare;
      this.totalFarePercent = branchViewModel.totalFarePercent;
      this.province.title = branchViewModel.province.title;
      this.province.id = branchViewModel.province.id;
      this.city.title = branchViewModel.city.title;
      this.city.id = branchViewModel.city.id;
      this.cmf.title = branchViewModel.cmfName;
      this.cmf.id = branchViewModel.cmfId;

      this.manufacturer.id = branchViewModel.manufacturer.id;
      this.manufacturer.title = branchViewModel.manufacturer.title;
    }
  }
  id: number;
  name: string;
  code: string;
  manager: string;
  phone1: string;
  phone2: string;
  address: string;
  fareContract: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  province: DualViewModelDto;
  city: DualViewModelDto;
  cmf: DualViewModelDto;
  manufacturer: DualViewModelDto;
  totalAccount: string;
  moeenAccount: string;
  markaz: string;
  project: string;
  maxPreFare40 = false;
  preFarePercent = 100;
  rewardPercent = 100;
  totalFarePercent = 100;
  maxFare = 1000000000
}
