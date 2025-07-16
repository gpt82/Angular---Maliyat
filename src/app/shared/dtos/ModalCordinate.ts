export class ModalCordinate {
    width: string;
    height: string;
    constructor(width: number, height: number) {
        this.width = width > 0 ? width + "px" : "0px";
        this.height = height > 0 ? height + "px" : "0px";
    }
};