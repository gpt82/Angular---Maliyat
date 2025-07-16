import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'ChakavakCurrency' })
export class ChakavakCurrency implements PipeTransform {
    transform(value: number, currency: string = "ریال", seperator: string = '', locale?: string): string {
        let result = (value !== undefined && value !== null)
            ? new Intl.NumberFormat(locale, {
                minimumFractionDigits: 0
            }).format(Number(value)) + currency
            : '';

        if (result == '') return result;
        
        switch (seperator) {
            case 'p':
                return '(' + result + ')';
            case 'b':
                return '[' + result + ']';
            case (''):
                return result;
            default: return result;
        }
    }
}