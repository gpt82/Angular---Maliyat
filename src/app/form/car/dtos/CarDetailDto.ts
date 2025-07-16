export class CarDetailDto {

    constructor(carViewModel) {
        if (carViewModel != null && carViewModel !== undefined) {
            this.id = carViewModel.id;
            this.bodyNumber = carViewModel.bodyNumber;
            this.externalNumber = carViewModel.externalNumber;
            this.owner = carViewModel.owner;
            this.agentId = carViewModel.agentId;
            this.agentTitle = carViewModel.agentTitle;
            this.deliveryAgentId = carViewModel.deliveryAgentId;
            this.deliveryAgentTitle = carViewModel.deliveryAgentTitle;
            this.carTypeId = carViewModel.carTypeId;
            this.carTypeTitle = carViewModel.carTypeTitle;
            this.registeredDate = carViewModel.registeredDate;
            this.descriptionOfSupply = carViewModel.descriptionOfSupply;
            this.loadingLocationId = carViewModel.loadingLocationId;
            this.loadingLocationTitle = carViewModel.loadingLocationTitle;
            this.entranceFromId = carViewModel.entranceFromId;
            this.entranceFromTitle = carViewModel.entranceFromTitle;
            this.state = carViewModel.state;
        }
    }
    id: number;
    bodyNumber: string;
    externalNumber?: string;
    owner: string;
    agentId: number;
    agentTitle: string;
    deliveryAgentId: number;
    deliveryAgentTitle: string;
    carTypeId: number;
    carTypeTitle: string;
    registeredDate: string;
    descriptionOfSupply: string;
    loadingLocationId?: number;
    loadingLocationTitle: string;
    entranceFromId?: number;
    entranceFromTitle: string;
    state: number;
}

