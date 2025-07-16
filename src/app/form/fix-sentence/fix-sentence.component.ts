import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FixSentenceDialog } from './fix-sentence.dialog';

import { FixSentenceDto } from './dtos/FixSentenceDto';
import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { FileDownloder } from '../../shared/services/file-downloader';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'fix-sentence-component',
  templateUrl: './fix-sentence.component.html',
  providers: [HttpClient]
})
export class FixSentenceComponent extends GridBaseClass {
  isEdit = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/FixedSentence/', dialog);
    this.fillGrid();
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  onExportToExcel(): void {
    const filter = this.getGridFilterHeader();

    this.http
      .get(this.getUrl() + 'export/excel', { headers: filter })
      .subscribe(
        result => {
          FileDownloder.SaveAs(
            result['content'],
            result['fileName'],
            '\ufeff',
            'text/csv'
          );
        },
        (error: any) => {
          console.log('onExportToExcel');
          console.log(error);
        }
      );
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(FixSentenceDialog, {
      width: '500px',
      height: '250px',
      disableClose: true,
      data: {
        Sentence: new FixSentenceDto(),
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
  onEdit(data): void {
    const dialogRef = this.dialog.open(FixSentenceDialog, {
      width: '500px',
      height: '250px',
      disableClose: true,
      data: {
        Sentence: data,
        dialogTitle: 'ویرایش ',
        isEdit: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }

  onDeleteById(id): void {
    this.deleteEntity(id);
  }

  getUrl() {
    return '/v1/api/FixedSentence/';
  }
  onClose(): void {}
}
