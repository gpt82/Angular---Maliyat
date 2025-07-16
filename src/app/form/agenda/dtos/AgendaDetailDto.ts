import * as moment from 'jalali-moment';
export class AgendaDetailDto {

    constructor(viewModel) {
        if (viewModel != null && viewModel !== undefined) {
            this.id = viewModel.id;
            this.waybillNumber = viewModel.waybillNumber;
            this.waybillSeries = viewModel.waybillSeries;
            this.isCashBill = viewModel.isCashBill;
            this.isCashBillPaid = viewModel.isCashBillPaid;
            this.isPreFarePaid = viewModel.isPreFarePaid;
            this.isDelivered = viewModel.isDelivered;
            this.cargoCode = viewModel.cargoCode;
            this.exportDate = viewModel.exportDate;
            this.senderId = viewModel.senderId;
            this.receiverId = viewModel.receiverId;
            this.receiverTitle = viewModel.receiverTitle;
            this.lttrNo = viewModel.lttrNo;
            this.carCount = viewModel.carCount;
            this.driverId = viewModel.driverId;
            this.driverTitle = viewModel.driverTitle;
            this.trailerId = viewModel.trailerId;
            this.trailerTitle = viewModel.trailerTitle;
            this.payTypeId = viewModel.payTypeId;
            this.payTypeTitle = viewModel.payTypeTitle;
            this.fare = viewModel.fare;
            this.preFare = viewModel.preFare;
            this.commision = viewModel.commision;
            this.milkRun = viewModel.milkRun;
            this.milkRunCount = viewModel.milkRunCount;
            this.reward = viewModel.reward;
            this.remainingFare = viewModel.remainingFare;
            this.description = viewModel.description;
            this.fareContract = viewModel.fareContract;
            this.branchId = viewModel.branchId;
            this.branchName = viewModel.branchTitle;
            this.transTime = viewModel.transTime;
            this.targetBranchId = viewModel.targetBranchId;
            this.loadingLocationId = viewModel.loadingLocationId;
            this.invoiceIsConfirmed = viewModel.invoiceIsConfirmed;
        }
    }

    id: number;
    waybillNumber: string;
    waybillSeries: string;
    isCashBill: boolean;
    isCashBillPaid: boolean;
    isPreFarePaid = false;
    isDelivered: boolean;
    cargoCode: string;
    exportDate = moment().locale('fa');
    senderId: number;
    receiverId: number;
    receiverTitle: string;
    carCount = 0;
    lttrNo: string;
    driverId: number;
    driverTitle: string;
    trailerId: number;
    trailerTitle: string;
    payTypeId = 1; // number;
    payTypeTitle: string;
    fare = 0;
    preFare = 0;
    commision = 0;
    milkRun = 0;
    milkRunCount = 0;
    reward = 0;
    remainingFare = 0;
    description: string;
    fareContract: number;
    branchId: number;
    branchName: string;
    transTime: number;
    distance: number;
    targetBranchId: number;
    loadingLocationId: number;
    invoiceIsConfirmed = false;
}








