
import * as moment from 'jalali-moment';
export class InvoiceDto {

  constructor(invoiceViewModel) {
    if (invoiceViewModel != null && invoiceViewModel !== undefined) {
      this.id = invoiceViewModel.id;
      this.invoiceNumber = invoiceViewModel.invoiceNumber;
      this.registeredDate = invoiceViewModel.registeredDate;
      this.ids = invoiceViewModel.ids;
      this.invoiceId = invoiceViewModel.invoiceId;
      this.payTypeId = invoiceViewModel.payTypeId;
      this.payTypeName = invoiceViewModel.payTypeName;
      this.description = invoiceViewModel.description;
      this.isConfirmed = invoiceViewModel.isConfirmed;
      this.sumAgenda = invoiceViewModel.sumAgenda;
      this.sumAmani = invoiceViewModel.sumAmani;
      this.sumRecar = invoiceViewModel.sumRecar;
      this.sumSubsidy = invoiceViewModel.sumSubsidy;
      this.sumPenalty = invoiceViewModel.sumPenalty;
      this.sumKaf = invoiceViewModel.sumKaf;
      this.sumHavale = invoiceViewModel.sumHavale;
      this.sumAccessory = invoiceViewModel.sumAccessory;
      this.sumFactor = invoiceViewModel.sumFactor;
      this.sumReplace = invoiceViewModel.sumReplace;
      this.sumSofte = invoiceViewModel.sumSofte;
    }
  }
  id: number;
  invoiceNumber: string;
  registeredDate = moment().locale('fa'); // : string;
  ids: string;
  invoiceId: number;
  payTypeId = 1;
  payTypeName: string;
  description: string;
  isConfirmed = false;
  sumAgenda = 0;
  sumAmani = 0;
  sumRecar = 0;
  sumSubsidy = 0;
  sumPenalty = 0;
  sumKaf = 0;
  sumHavale = 0;
  sumAccessory = 0;
  sumFactor = 0;
  sumReplace = 0;
  sumSofte = 0;
}

export class SelectData {
  id: number;
  title: string;
}
