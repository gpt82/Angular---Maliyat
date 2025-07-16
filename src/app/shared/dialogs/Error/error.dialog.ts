import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'error-dialog',
  templateUrl: 'error.dialog.html',
  // tslint:disable-next-line:use-host-property-decorator
  host: { '(window:keydown)': 'hotkeys($event)' }
})
// tslint:disable-next-line:component-class-suffix
export class ErrorDialog {
  constructor(
    public dialogRef: MatDialogRef<ErrorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.messageText === undefined) {
      data.messageText = 'شماره بدنه قبلا وارد شده است';
    }
  }
  onClick(state): void {
    this.dialogRef.close({ state: state });
  }

  hotkeys(event) {
    if (event.code === 'Escape') {
      this.stopPropagationEvent(event);
      this.onClick('');
    } else if (event.code === 'Enter') {
      this.stopPropagationEvent(event);
      this.onClick('errored');
    }
  }
  stopPropagationEvent(event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
