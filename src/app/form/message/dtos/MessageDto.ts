import * as moment from 'jalali-moment';
export class MessageDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel !== undefined) {
      this.id = viewModel.id;
      this.messageNo = viewModel.messageNo;
      this.description = viewModel.description;
      this.registeredDate = viewModel.registeredDate;
      this.senderId = viewModel.senderId;
      this.senderTitle = viewModel.senderTitle;
      this.reciverIds = viewModel.reciverIds;
    }
  }
  id: number;
  messageNo: string;
  description: string;
  registeredDate = moment().locale('fa');
  senderId: number;
  senderTitle: string;
  reciverIds: string;
}
