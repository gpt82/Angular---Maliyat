import * as moment from 'jalali-moment';
export class DailyOperationDto {

  id: number;
  count = 0;

  branchId: number;
  branchName:string;

  tonnageTypeId: number;
  tonnageTypeName:string;
  
  issueDate = moment().locale('fa');

  constructor(dailyOprationViewModel) {
    if (dailyOprationViewModel != null && dailyOprationViewModel != undefined) {
      this.id = dailyOprationViewModel.id;
      this.count = dailyOprationViewModel.count;

      this.branchId = dailyOprationViewModel.branchId;
      this.branchName = dailyOprationViewModel.branchName;

      this.tonnageTypeId = dailyOprationViewModel.tonnageTypeId;
      this.tonnageTypeName = dailyOprationViewModel.tonnageTypeName;

      this.issueDate = dailyOprationViewModel.issueDate;
    }
  }
}
