import { Injectable } from '@angular/core';
@Injectable()
export class ConverterService {

    public static ByteToKByte(byte: number): number {
        return byte / 1024;
    }
    public static ByteToMegaByte(byte: number): number {
        return byte / (1024 * 1024);
    }
}