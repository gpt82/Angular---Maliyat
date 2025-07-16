import { Directive, ElementRef, Input, Output, EventEmitter,  HostListener } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { DeleteDialog } from '../dialogs/Delete/delete.dialog';


@Directive({
    selector: '[delete-directive]'
})
export class DeleteDirective {
    @Output() onDelete: EventEmitter<any> = new EventEmitter();
    @Input() messageText: string;
    constructor(el: ElementRef, private dialog: MatDialog) {}
    @HostListener('click') onMouseClick() {

        const dialogRef =  this.dialog.open(DeleteDialog, {
            height: '250px',
            disableClose: true,
            data: {
                messageText: this.messageText
            }
          });
          dialogRef.afterClosed().subscribe((result)=>{
            if(result === true){
             this.onDelete.emit();
            }
        });
      }
}
