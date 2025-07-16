
export class BankAccountDto {

  id: number;
  trailerId: number;
  trailerPlaque:string;
  name: string;
  bankId: number;
  bankName:string;
  accNumber: string;
  accCardNumber: string;
  accShaba: string;
  description: string;
  isActive = false;

  constructor(bankAccountViewModel) {
    if (bankAccountViewModel != null && bankAccountViewModel != undefined) {
      this.id = bankAccountViewModel.id;
      this.trailerId = bankAccountViewModel.trailerId;
      this.trailerPlaque = bankAccountViewModel.trailerPlaque;
      this.name = bankAccountViewModel.name;

      this.bankId = bankAccountViewModel.bankId;
      this.bankName = bankAccountViewModel.bankName;

      this.accNumber = bankAccountViewModel.accNumber;
      this.accCardNumber = bankAccountViewModel.accCardNumber;
      this.accShaba = bankAccountViewModel.accShaba;
      this.isActive = bankAccountViewModel.isActive ;
      this.description = bankAccountViewModel.description;
    }
  }
}
