import { DualViewModelDto } from "../../../shared/dtos/DualViewModelDto";

export class DeliveryWaybillDto {
    constructor(agentViewModel) {
        this.branch = new DualViewModelDto();
        
        if (agentViewModel != null && agentViewModel != undefined) {
            
            this.id = agentViewModel.id;
            this.deliveryDate = agentViewModel.deliveryDate;
            this.fromNumber = agentViewModel.fromNumber;
            this.remaining = agentViewModel.remaining;
            this.series = agentViewModel.series;
            this.toNumber = agentViewModel.toNumber;
            this.totalCount = agentViewModel.total;
            this.branch.id = agentViewModel.branchId;
            this.branch.title = agentViewModel.branchTitle;
        }

    }
    id: number;
    branch: DualViewModelDto;
    fromNumber: string;
    toNumber: string;
    series: string;
    deliveryDate: string;
    totalCount: string;
    remaining: string;

}