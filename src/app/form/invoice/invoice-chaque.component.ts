import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ChaqueDialog } from '../chaque/chaque.dialog';
import { InvoiceService } from './invoice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChaqueDetailDto } from '../chaque/dtos/chaqueDetailDto';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { GridService } from '../../shared/services/grid.service';
import { map } from 'rxjs/operators';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'invoice-chaque-component',
  templateUrl: 'invoice-chaque.component.html',

})
// tslint:disable-next-line: component-class-suffix
export class InvoiceChaqueComponent implements OnInit {
  public view: Observable<GridDataResult>;
  service: GridService;
  constructor(
    public dialogRef: MatDialogRef<ChaqueDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public authService: AuthService,
    public invoiceService: InvoiceService
  ) {
  }

  ngOnInit() {
    this.fillGrid();
  }
  fillGrid() {

    this.view = this.http.get('/v1/api/Invoice/InvoiceId/' + this.data.InvoiceId).pipe(
      map(
        response =>
          <GridDataResult>{
            data: response['entities'],
            total: parseInt(response['totalCount'], 10)
          }
      ));
  }
  onClose(): void {
    this.dialogRef.close({ data: null, state: 'cancel' });
    // if (!this.form.dirty) { this.dialogRef.close({ data: null, state: 'cancel' }); } else {
    //   const dialogRef = this.dialog.open(ConfirmDialog, {
    //     width: '250px',
    //     data: { state: 'ok' }
    //   });

    //   dialogRef.afterClosed().subscribe(result => {
    //     if (result.state === 'confirmed') {
    //       this.dialogRef.close({ data: null, state: 'cancel' });
    //     }
    //   });
    // }
  }
  onCreate(): void {
    const dialogRef = this.dialog.open(ChaqueDialog, {
      width: '700px',
      height: '450px',
      disableClose: true,
      data: {
        Chaque: new ChaqueDetailDto(null),
        InvoiceId: '1137',
        dialogTitle: 'ایجاد',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }
  onEdit(id: number): void {
    this.http.get('/v1/api/Chaque/' + id).subscribe(result => {
      const chaque = new ChaqueDetailDto(result['entity']);
      const dialogRef = this.dialog.open(ChaqueDialog, {
        width: '700px',
        height: '450px',
        disableClose: true,
        data: {
          Chaque: chaque,
          dialogTitle: 'ویرایش ',
          isEdit: true
        }
      });
      dialogRef.afterClosed().subscribe(result2 => {
        if (result2 && result2.state === 'successful') {
          this.fillGrid();
        }
      });
    });
  }
  onDelete(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: {
        messageText: 'آیا مایل به حذف این چک هستید؟'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.state === 'confirmed') {
        const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
        this.http
          .delete('/v1/api/Chaque/' + id, { headers: headers1 })
          .subscribe(res => {
            this.fillGrid();
          });
      }
    });

  }
  getUrl() {
    return '/v1/api/Chaque/';
  }
}
