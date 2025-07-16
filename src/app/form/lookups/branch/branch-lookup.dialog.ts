import { Component, Inject } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { HttpClient } from "@angular/common/http";
import { GridBaseClass } from "../../../shared/services/grid-base-class";
import { BranchDialog } from "../../branch/branch.dialog";
import { BranchDto } from "../../branch/dtos/BranchDto";

@Component({
  selector: "branch-lookup.dialog",
  templateUrl: "./branch-lookup.dialog.html",
  providers: [HttpClient],

})
export class BranchLookup extends GridBaseClass {
  getUrl(): string {
    return "/v1/api/branch";
  }
  onEdit(data: any): void {}
  constructor(
    public dialogRef: MatDialogRef<BranchLookup>,
    public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super(http, "/v1/api/branch", dialog);
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
    let dialogRef = this.dialog.open(BranchDialog, {
      width: "700px",
      height: "500px",
      disableClose: true,
      data: {
        Branch: new BranchDto(null),
        dialogTitle: "ایجاد",
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state == "successful") {
        this.fillGrid();
      }
    });
  }
  onClose(): void {
    this.dialogRef.close({ data: null });
  }
}
