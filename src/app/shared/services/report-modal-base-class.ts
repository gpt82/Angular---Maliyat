import { HostListener, Injectable, ViewChild } from '@angular/core';

@Injectable()
export abstract class ReportModalBaseClass {
  @ViewChild('form', {static: false})  form;

  constructor() {}

  @HostListener('keydown', ['$event'])
  public keydown(event: any): void {
    if (event.keyCode === 27) {
      this.onClose();
      this.stopPropagationEvent(event);
    } else if (event.code === 'F2') {
      this.onPrint();
      this.stopPropagationEvent(event);
    }
  }
  stopPropagationEvent(event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  abstract onPrint();
  abstract onClose();
}
