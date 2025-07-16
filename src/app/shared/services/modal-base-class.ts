import { HostListener, Injectable, ViewChild } from '@angular/core';

import { NgSelectComponent } from '@ng-select/ng-select';

@Injectable()
export abstract class ModalBaseClass {
  @ViewChild('form') form;

  protected constructor() { }

  @HostListener('keydown', ['$event'])
  public keydown(event: any): void {
    if (event.keyCode === 27) {
      this.onClose();
      this.stopPropagationEvent(event);
    } else if (event.code === 'F2') {
      this.onSave();
      this.stopPropagationEvent(event);
    }
  }
  stopPropagationEvent(event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  closeSelect(select: NgSelectComponent) {
    select.close();
  }

  getItem(key): any {
    return JSON.parse(localStorage.getItem(key));
  }
  setItem(key: string, value: any, replaceIfExist: boolean = true): void {
    if (replaceIfExist || this.getItem(key) == null) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  abstract onSave();
  abstract onClose();
}
