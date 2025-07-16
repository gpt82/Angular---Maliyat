import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  GridDataResult,
  DataStateChangeEvent
} from '@progress/kendo-angular-grid';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FixSentenceDto } from '../../fix-sentence/dtos/FixSentenceDto';
import { FixSentenceDialog } from '../../fix-sentence/fix-sentence.dialog';
import { GridBaseClass } from '../../../shared/services/grid-base-class';


@Component({
  selector: 'fix-sentence-lookup-component',
  templateUrl: './fix-sentence-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class FixSentenceLookupComponent extends GridBaseClass {
  getUrl(): string {
    return '/v1/api/FixedSentence/';
  }
  onEdit(data: any): void {
  }
  constructor(
    public dialogRef: MatDialogRef<FixSentenceLookupComponent>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, '/v1/api/FixedSentence/', dialog);
    this.fillGrid();
  }

  fillGrid() {
    this.applyGridFilters();
    this.view = this.service;
  }
  onSelect(item): void {
    this.dialogRef.close({ data: { selectedItem: item } });
  }
  onCreate(): void {
    const dialogRef = this.dialog.open(FixSentenceDialog, {
      width: '400px',
      height: '365px',
      disableClose: true,
      data: {
        Sentence: new FixSentenceDto(),
        dialogTitle: 'ایجاد',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state == 'successful') {
        this.fillGrid();
      }
    });
  }
  onClose(): void {}
}

