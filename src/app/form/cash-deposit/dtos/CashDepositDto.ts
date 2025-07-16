
import * as moment from 'jalali-moment';
export class CashDepositDto {

  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.cashDepositNumber = viewModel.cashDepositNumber;
      this.registeredDate = viewModel.registeredDate;
      this.agendaIds = viewModel.agendaIds;
      this.cashDepositId = viewModel.cashDepositId;
      this.description = viewModel.description;
      this.isConfirmed = viewModel.isConfirmed;
      this.sumFare = viewModel.sumFare;
      this.sumPreFare = viewModel.sumPreFare;
      this.sumReward = viewModel.sumReward;
      this.sumMilkRun = viewModel.sumMilkRun;
      this.sumRemainingFare = viewModel.sumRemainingFare;
    }
  }
  id = 0;
  cashDepositNumber: string;
  registeredDate = moment().locale('fa'); // : string;
  agendaIds: string;
  cashDepositId: number;
  description: string;
  isConfirmed = false;
  sumFare = 0;
  sumPreFare = 0;
  sumReward = 0;
  sumMilkRun = 0;
  sumRemainingFare = 0;
}

export class SelectData {
  id: number;
  title: string;
}
