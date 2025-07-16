export class HavaleDto {
  constructor(viewModel) {
    if (viewModel != null && viewModel != undefined) {
      this.id = viewModel.id;
      this.havaleNo = viewModel.havaleNo;
      this.srcBranchId = viewModel.srcBranchId;
      this.srcBranchName = viewModel.srcBranchName;
      this.dstBranchId = viewModel.dstBranchId;
      this.dstBranchName = viewModel.dstBranchName;
      this.description = viewModel.description;
      this.amount = viewModel.amount;
      this.issueDate = viewModel.issueDate;
      this.trailerId = viewModel.trailerId;
      this.trailerPlaque = viewModel.trailerPlaque;
      this.driverId = viewModel.driverId;
      this.driverName = viewModel.driverName;
    }
  }
  id: number;
  havaleNo: string;
  srcBranchId: string;
  srcBranchName: string;
  dstBranchId: string;
  dstBranchName: string;
  trailerId: number;
  trailerPlaque: string;
  driverId: number;
  driverName: string;
  description: string;
  amount: number;
  issueDate: string;
  phone: string;
  address: string;
}
