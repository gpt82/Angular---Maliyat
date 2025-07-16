import { DualViewModelDto } from "../../../shared/dtos/DualViewModelDto";

export class TrailerDto1 {
    constructor(trailerViewModel) {
        this.tonnageType = new DualViewModelDto();
        this.ownerType = new DualViewModelDto();
        this.builder = new DualViewModelDto();
        this.plateChar = 'ع';

        if (trailerViewModel != null) {
            this.name = trailerViewModel.name;
            this.id = trailerViewModel.id;
            this.smartCardNumber = trailerViewModel.smartCardNumber;
            this.tafsiliAccount = trailerViewModel.tafsiliAccount;
            this.plaque = trailerViewModel.plaque;
            this.plate1 = trailerViewModel.plate1;
            this.plate2 = trailerViewModel.plate2;
            this.plateChar = trailerViewModel.plateChar;
            this.plateIran = trailerViewModel.plateIran;

            if (trailerViewModel.builder != null || trailerViewModel.builder != undefined) {
                this.builder.id = trailerViewModel.builder.id;
                this.builder.title = trailerViewModel.builder.title;
            }

            this.tonnageType.id = trailerViewModel.tonnageType.id;
            this.tonnageType.title = trailerViewModel.tonnageType.title;
            this.hasInfringement = trailerViewModel.hasInfringement;
            this.infringementDescription = trailerViewModel.infringementDescription;
            this.canGetPreFare = trailerViewModel.canGetPreFare;
            this.isBorrowLoan = trailerViewModel.isBorrowLoan;
            this.isBorrowLoan = trailerViewModel.isBorrowLoan;
            this.isKafi = trailerViewModel.isKafi;            
            if (trailerViewModel.ownerType) {
                this.ownerType.id = trailerViewModel.ownerType.id;
                this.ownerType.title = trailerViewModel.ownerType.title;
            }
        }
    }
    name: string;
    id: number;
    smartCardNumber: string;
    tafsiliAccount: string;
    plaque: string;
    plate1: number;
    plate2: number;
    plateChar: string;
    plateIran: number;
    builder: DualViewModelDto;
    tonnageType: DualViewModelDto;
    hasInfringement: boolean;
    infringementDescription: boolean;
    canGetPreFare: boolean;
    isBorrowLoan: false;
    isKafi: false;
    ownerType: DualViewModelDto
}
