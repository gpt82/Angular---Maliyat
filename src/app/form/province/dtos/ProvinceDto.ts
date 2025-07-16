export class ProvinceDto {
    constructor(provinceViewModel) {
        if (provinceViewModel != null && provinceViewModel != undefined) {
            this.id = provinceViewModel.id;
            this.code = provinceViewModel.code;
            this.name = provinceViewModel.name;
            this.parrentId = provinceViewModel.parrentId;
            this.type = provinceViewModel.type;
        }
    }
    id: number;
    name: string;
    code: string;
    type: number;
    transTime: number = 0;
    parrentId: number;
}