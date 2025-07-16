import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'delete-dialog',
    templateUrl: 'delete.dialog.html',
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class DeleteDialog {
    constructor(
        public dialogRef: MatDialogRef<DeleteDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        if (data.messageText == undefined) {
            data.messageText = "آیا مایل به حذف رکورد مورد نظر می باشید؟";
        }
    }

    hotkeys(event) {
        if (event.code == "Escape") {
            this.dialogRef.close(null);
            this.stopPropagationEvent(event);
        }
    }
    stopPropagationEvent(event): void {
        event.preventDefault();
        event.stopPropagation();
    }
}
