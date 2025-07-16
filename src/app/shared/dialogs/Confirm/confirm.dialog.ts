import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'confirm-dialog',
  templateUrl: 'confirm.dialog.html',
  // tslint:disable-next-line:use-host-property-decorator
  host: { '(window:keydown)': 'hotkeys($event)' }
})
// tslint:disable-next-line:component-class-suffix
export class ConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.messageText === undefined) {
      data.messageText = 'اطلاعات فرم تغییر کرده است؛ آیا از فرم خارج می شوید؟';
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
      this.onClick('confirmed');
    }
  }
  stopPropagationEvent(event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
