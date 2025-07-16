import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { BankDialog } from './bank.dialog'
import { BankDto } from './dtos/BankDto'
import { HttpClient } from '@angular/common/http'
import { GridBaseClass } from '../../shared/services/grid-base-class'
import { State } from '@progress/kendo-data-query'
import { AuthService } from '../../core/services/app-auth-n.service'

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'Bank-component',
  templateUrl: './bank.component.html',
  providers: [HttpClient],
})
export class BankComponent extends GridBaseClass {
  isEdit = false

  constructor(
    public dialog: MatDialog,
    http: HttpClient,
    public authService: AuthService
  ) {
    super(http, '/v1/api/Bank/', dialog)
    this.gridName = 'bankGrid'
    const gridSettings: State = this.getState()

    if (gridSettings !== null) {
      this.state = gridSettings
    }
    this.fillGrid()
  }
  fillGrid() {
    super.applyGridFilters()
    this.view = this.service
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(BankDialog, {
      width: '700px',
      height: '400px',
      disableClose: true,
      data: {
        bank: new BankDto(null),
        dialogTitle: 'ایجاد',
        isEdit: false,
      },
    })
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.state === 'successful') {
        this.fillGrid()
      }
    })
  }

  onEdit(data): void {
    const bank = new BankDto(data)

    const dialogRef = this.dialog.open(BankDialog, {
      width: '700px',
      height: '400px',
      disableClose: true,
      data: {
        bank: bank,
        dialogTitle: 'ویرایش ',
        isEdit: true,
      },
    })
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.state === 'successful') {
        this.fillGrid()
      }
    })
  }

  onDeleteById(id): void {
    this.deleteEntity(id)
  }

  getUrl() {
    return '/v1/api/Bank/'
  }
  onClose(): void {}
}
