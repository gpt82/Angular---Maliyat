export class BankDto {
  constructor(BankViewModel) {
    if (BankViewModel != null && BankViewModel !== undefined) {
      this.name = BankViewModel.name
      this.id = BankViewModel.id
      this.code = BankViewModel.code
      this.address = BankViewModel.address
    }
  }
  name: string
  id: number
  code: string
  address: string
}
