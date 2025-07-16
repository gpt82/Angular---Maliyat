import { Component, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';
@Component({
  selector: 'exit-car-dialog',
  templateUrl: 'exit-car.dialog.html',
})
export class ExitCarDialog {
  constructor(
    public dialogRef: MatDialogRef<ExitCarDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog) {

  }
  @HostListener('window:keyup.esc') onKeyUp() {
    this.dialogRef.close();
  }

  onClose(form): void {
    this.dialogRef.close({ data: null, state: "cancel" });
  }
  onSave(data, isValid: boolean): void {
    if (isValid) {
      let headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.put(this.getUrl() + data.id, JSON.stringify({
        ExitDate: data.exitDate != null
          ? moment.from(data.exitDate, 'fa').format('YYYY/MM/DD')
          : null,
        ReceiverFirstName: data.receiverFirstName,
        ReceiverLastName: data.receiverLastName,
        Description: data.description
      }), { headers: headers1 }).subscribe((result) => {
        this.dialogRef.close({ state: "successful" });
      }, (error: any) => {
        console.log("exit car");
        console.log(error);
      });
    }
  }

  getUrl() {
    return "/v1/api/Car/ExitCar/";
  }
}
