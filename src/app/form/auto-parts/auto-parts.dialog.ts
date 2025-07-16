import { Component, Inject, HostListener, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AutoPartsService } from './auto-parts.service';
import { AutoParts } from './dtos/auto-partsDto';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { Observable, Subject, fromEvent, concat, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';
import { GridComponent } from '@progress/kendo-angular-grid';
import { AuthService } from '../../core/services/app-auth-n.service';
const createFormGroup = item => new FormGroup({
  'partId': new FormControl(item.partId, Validators.required),
  'partName': new FormControl(item.partName),
  'packagingId': new FormControl(item.packagingId, Validators.required),
  'loadingLocationId': new FormControl(item.loadingLocationId, Validators.required),
  'amount': new FormControl(item.amount, Validators.required)
});
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'AutoParts-dialog',
  templateUrl: 'auto-parts.dialog.html',

})
// tslint:disable-next-line: component-class-suffix
export class AutoPartsDialog extends ModalBaseClass {
  autoParts = this.data['autoParts'];
  public formGroup: FormGroup;
  goods = [];
  packagings = [];
  loadingLocations = [];
  private editedRowIndex: number;

  constructor(
    public dialogRef: MatDialogRef<AutoPartsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    private service: AutoPartsService,
    private elementRef: ElementRef,
    private formBuilder: FormBuilder,
    public authService: AuthService) {
    super();

    // this.loadGoods();
    this.http.get<any>('/v1/api/lookup/loadingLocations').subscribe(result =>
      this.loadingLocations = result);

    this.http.get<any>('/v1/api/lookup/packagings').subscribe(result =>
      this.packagings = result);

    this.http.get<any>('/v1/api/lookup/goods').subscribe(result =>
      this.goods = result);

    // this.createFormGroup = this.createFormGroup.bind(this);
  }
  // ngOnInit() {
  //   this.subscription = fromEvent(this.elementRef.nativeElement, 'keyup').subscribe((e:KeyboardEvent) => {
  //     console.log(e);
  //     // if(e.key==='Insert'){
  //     //   this.addHandler({this.sender});
  //     // }
  //   });
  // }
  // public createFormGroup(dataItem: any): FormGroup {
  //   const item = dataItem;

  //   this.formGroup = this.formBuilder.group({
  //     'partId': [item.partId, Validators.required],
  //     'partName': item.partName,
  //     'packagingId': [item.packagingId, Validators.required],
  //     'loadingLocationId': [item.loadingLocationId, Validators.required],
  //     'amount': [item.amount, Validators.required]
  //   });

  //   return this.formGroup;
  // }
  //   public addHandler({ sender }) {

  //     this.formGroup = this.formBuilder.group({
  //       'partId': [1, Validators.required],
  //       'partName': '',
  //       'packagingId': [1, Validators.required],
  //       'loadingLocationId': [1, Validators.required],
  //       'amount': [0, Validators.required]
  //     });

  //     sender.addRow(this.formGroup);
  // }
  public addHandler({ sender }) {
    this.closeEditor(sender);

    this.formGroup = createFormGroup({
      'partId': 1,
      'partName': '',
      'packagingId': 1,
      'loadingLocationId': 1,
      'amount': 0
    });

    sender.addRow(this.formGroup);
  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.closeEditor(sender);

    this.formGroup = createFormGroup(dataItem);

    this.editedRowIndex = rowIndex;

    sender.editRow(rowIndex, this.formGroup);
  }

  public cancelHandler({ sender, rowIndex }) {
    this.closeEditor(sender, rowIndex);
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew }): void {
    const parts = formGroup.value;

    if (isNew) {
      this.autoParts.splice(0, 0, parts);
    } else {
      Object.assign(this.autoParts[rowIndex], parts);
    }

    sender.closeRow(rowIndex);
  }

  public removeHandler({ dataItem }): void {
    // this.service.remove(dataItem);
    const index = this.autoParts.findIndex(({ partId }) => partId === dataItem.partId);
    this.autoParts.splice(index, 1);
  }

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }
  public packaging(id: number): any {
    return this.packagings.find(x => x.id === id);
  }
  public loadingLocation(id: number): any {
    return this.loadingLocations.find(x => x.id === id);
  }
  public goodsName(id: number): any {
    return this.goods.find(x => x.id === id);
  }
  onClose(): void {
    // if (this.formGroup != null && !this.formGroup.dirty) {
    this.dialogRef.close({ data: null, state: 'cancel' });
    // } else {
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

  onSave() {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post(`/v1/api/Agenda/${this.data.agendaId}/AutoParts`,
      JSON.stringify({
        Id: this.data.agendaId,
        AutoParts: this.autoParts
      }), { headers: headers1 }).subscribe((result) => {
        if (result['succeeded'] === true) {
          this.dialogRef.close();
        }
      });

  }

  getUrl() {
    return '/v1/api/AutoParts/';
  }

}
