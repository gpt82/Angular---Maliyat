import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { HttpClient } from '@angular/common/http';
import { GridBaseClass } from '../../../shared/services/grid-base-class';
//import { moment } from "ngx-bootstrap/chronos/test/chain";
import { ContactDialog } from '../../person/contact.dialog';
import { PersonDto } from '../../person/dtos/PersonDto';

@Component({
  selector: 'person-lookup-component',
  templateUrl: './person-lookup.dialog.html',
  providers: [
    HttpClient
  ],


})
export class PersonLookup extends GridBaseClass {
  getUrl(): string {
    return "/v1/api/person/";
  }
  onEdit(data: any): void {
  }
  constructor(
    public dialogRef: MatDialogRef<PersonLookup>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(http, "/v1/api/Person/", dialog);
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
    // var currentDate = moment();
    let dialogRef = this.dialog.open(ContactDialog, {
      width: "600px",
      height: "600px",
      disableClose: true,
      data: {
        Person: new PersonDto(null),
        dialogTitle: 'ایجاد',
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D',
          showGoToCurrent: 'true'
        },
        // thirdPartyInsuranceDate: currentDate.locale('fa'),
        // techDiagnosisInsuranceDate: currentDate.locale('fa'),
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state == 'successful') {
        this.fillGrid();
      }
    });
  }
  onClose(): void {
    this.dialogRef.close({ data: null });
  }
}

