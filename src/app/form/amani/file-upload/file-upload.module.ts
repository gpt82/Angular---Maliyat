import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadInputComponent } from './file-upload.component';
import { FileUploadModule } from 'ng2-file-upload';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
    declarations:[FileUploadInputComponent],
  imports: [
      CommonModule,
      FormsModule,
      FileUploadModule,
      MatIconModule,
      MatButtonModule
    ],
    exports:[FileUploadInputComponent]
})
export class FileUploadInputModule { }
