import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'import-from-excel-dialog',
  templateUrl: 'import-from-excel.dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class ImportFromExcelDialog extends ModalBaseClass implements OnInit {
  file: File | null = null;
  succeededArray: string[];
  failedArray: string[];
  constructor(
    public dialogRef: MatDialogRef<ImportFromExcelDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) {
    super();
  }
  ngOnInit() {



  }
  onClose(): void {
    this.dialogRef.close({ data: null, state: 'cancel' });
  }
  onFileChange(event: any): void {
    this.file = event.target.files[0];
  }

uploadFile(): void {
  const formData: FormData = new FormData();
  if(this.file) {
  formData.append('file', this.file, this.file.name);

  this.http.post(this.getUrl(), formData).subscribe(
    (response) => {
      this.succeededArray = response['succeededArray'];
      this.failedArray = response['failedArray'];
    },
    (error) => {
      console.error('Error uploading file', error);
    }
  );
}
  }

onSave(): void {
  if(this.form.valid) {
  this.dialogRef.close({
    state: 'successful',
    branchIds: this.form.get('branchIds')?.value.join(),
    // fromDate: moment
    //   .from(this.form.get('fromDate').value, 'en')
    //   .utc(true)
    //   .toJSON(),
    // toDate: moment
    //   .from(this.form.get('toDate').value, 'en')
    //   .utc(true)
    //   .toJSON()
  });
}
  }
onIgnore(): void {
  if(this.form.valid) {
  this.dialogRef.close({
    state: 'fail'
  });
}
  }

getUrl() {
  return '/v1/api/Agenda/uploadExcel/';
}
}
