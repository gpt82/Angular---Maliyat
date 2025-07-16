import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[enLang]'
})
export class EnLanguageDirective {

  caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ';
  persian = 'شذزیثبلاهتنمئدخحضقسفعرصطغظabcdefghijklmnopqrstuvwxyz';
  constructor(public ref: ElementRef) { }

  @HostListener('input')
  onChange() {
    this.ref.nativeElement.value = this.Convert2En((this.ref.nativeElement as HTMLInputElement).value);
  }
  Convert2En(term: string): string {
    let t;
    const a = term.split('');

    for (let i = 0; i < a.length; i++) {
      switch (a[i]) {
        case 'ش': {
          a[i] = 'A';
          break;
        }
        case 'َ': {
          a[i] = 'A';
          break;
        }
        case 'إ': {
          a[i] = 'B';
          break;
        }
        case 'ژ': {
          a[i] = 'C';
          break;
        }
        case 'ِ': {
          a[i] = 'D';
          break;
        }
        case 'ٍ': {
          a[i] = 'E';
          break;
        }
        case 'ّ': {
          a[i] = 'F';
          break;
        }
        case 'ۀ': {
          a[i] = 'G';
          break;
        }
        case 'آ': {
          a[i] = 'H';
          break;
        }
        case ']': {
          a[i] = 'I';
          break;
        }
        case 'ـ': {
          a[i] = 'J';
          break;
        }
        case '«': {
          a[i] = 'K';
          break;
        }
        case '»': {
          a[i] = 'L';
          break;
        }
        case '': {
          a[i] = 'ء';
          break;
        }
        case 'ء': {
          a[i] = 'N';
          break;
        }
        case '[': {
          a[i] = 'O';
          break;
        }
        case '\\': {
          a[i] = 'P';
          break;
        }
        case 'ً': {
          a[i] = 'Q';
          break;
        }
        // case "ريال" :{
        //   a[i]="R";
        //   break;
        // }
        case 'ُ': {
          a[i] = 'S';
          break;
        }
        case '،': {
          a[i] = 'T';
          break;
        }
        case ',': {
          a[i] = 'U';
          break;
        }
        case 'ؤ': {
          a[i] = 'V';
          break;
        }
        case 'ٌ': {
          a[i] = 'W';
          break;
        }
        case 'ي': {
          a[i] = 'X';
          break;
        }
        case '؛': {
          a[i] = 'Y';
          break;
        }
        case 'ة': {
          a[i] = 'Z';
          break;
        }

      }
      if (this.persian.indexOf(a[i]) > 0) {
        t = this.caps[this.persian.indexOf(a[i])];
        a[i] = t;
      }
    }
    return a.join('').replace('VXHG', 'R');
  }

}
