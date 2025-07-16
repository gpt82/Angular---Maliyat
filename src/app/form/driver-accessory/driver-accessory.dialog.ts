import { Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'jalali-moment';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { concat, Observable, of, Subject, merge } from 'rxjs';

import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap
} from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'driver-accessory-dialog',
  templateUrl: 'driver-accessory.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class DriverAccessoryDialog extends ModalBaseClass implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('issueDatePicker') issueDatePicker;
  form: FormGroup;
  public selectedItems: number[] = [];

  accessoryItems: any[] = [];
  accessoryDSC = '';
  sumAmount = 0;

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();
  trailerPlaque = '';

  driversLoading = false;
  drivers$: Observable<Object | any[]>;
  driversInput$ = new Subject<string>();
  driverName = '';

  constructor(
    public dialogRef: MatDialogRef<DriverAccessoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    super();

    this.loadDrivers();
    this.loadTrailers();
  }

  ngOnInit(): void {
    this.CreateForm();
    this.getAccessoryItems();

  }
  getAccessoryItems() {
    const url = '/v1/api/Accessory';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      this.accessoryItems.push(...result['entityLinkModels'].map(m => m.entity));
      this.selectedItems = this.data.DriverAccessory.selectedItems !== null ? this.data.DriverAccessory.selectedItems
        .split(',').map(x => +x) : [];
    });
  }
  private CreateForm() {
    this.form = this.fb.group(
      {
        driverId: [this.data.DriverAccessory.driverId, Validators.required],
        trailerId: [this.data.DriverAccessory.trailerId, Validators.required],
        description: this.data.DriverAccessory.description || '',
        issueDate: [moment(this.data.DriverAccessory.issueDate).locale('fa'), Validators.required],
        selectedItems: [this.data.DriverAccessory.selectedItems],
        amount: [this.data.DriverAccessory.amount,{ validators: [Validators.required], updateOn: 'change' }],
      },
      { updateOn: 'blur' }
    );
  }

  popUpCalendar2() {
    this.issueDatePicker.open();
  }

  private loadDrivers() {
    this.drivers$ = concat(
      of([
        {
          id: this.data.DriverAccessory.driverId,
          title: this.data.DriverAccessory.driverTitle
        }
      ]),
      this.driversInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.driversLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/drivers/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.driversLoading = false))
          )
        )
      )
    );
  }

  private loadTrailers() {
    this.trailers$ = concat(
      of([
        {
          id: this.data.DriverAccessory.trailerId,
          title: this.data.DriverAccessory.trailerTitle
        }
      ]),
      this.trailersInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.trailersLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/trailers/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.trailersLoading = false))
          )
        )
      )
    );
  }
  // onChangeSelectedDriver(item: any) {
  //   if (item !== undefined) {
  //     this.trailers$ =
  //       of([
  //         {
  //           id: item['trailerId'],
  //           title: item['trailerPlaque']
  //         }
  //       ]);
  //     this.form.get('trailerId').setValue(item['trailerId']);
  //   }
  // }
  onClose(): void {
    if (!this.form.dirty) {
      this.dialogRef.close({ data: null, state: 'cancel' });
    } else {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '250px',
        data: { state: 'ok' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.state === 'confirmed') {
          this.dialogRef.close({ data: null, state: 'cancel' });
        }
      });
    }
  }
  onSelectedItemChange() {
    this.sumAmount = this.accessoryItems.filter((itm) => this.selectedItems.indexOf(itm.id) > -1).map(i => i.amount)
      .reduce((sum, current) => sum + current);
      this.form.get('amount').patchValue(this.sumAmount);
  }
  onSave(): void {
    if (this.form.valid) {
      this.accessoryDSC = this.accessoryItems.filter((itm) => this.selectedItems.indexOf(itm.id) > -1).map(i => i.name).join();
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });

      const accessory = JSON.stringify({
        DriverId: this.form.get('driverId').value,
        TrailerId: this.form.get('trailerId').value,
        // Description: this.form.get('description').value || '',
        Description: this.form.get('description').value,
        IssueDate:
          this.form.get('issueDate').value != null
            ? moment
              .from(this.form.get('issueDate').value, 'en')
              .utc(true)
              .toJSON()
            : null,
        SelectedItems: this.selectedItems.join(),
        SelectedDsc: this.accessoryDSC,
        Amount: this.form.get('amount').value,
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getUrl() + this.data.DriverAccessory.id, accessory, { headers: header })
          .subscribe(
            result => {
              const obj = {
                state: 'successful',
                accessoryDsc: this.accessoryDSC,
                id: result['entity'].id
              };
              this.dialogRef.close(obj);
            },
            (error: any) => {
              console.log('create ');
              console.log(error);
            }
          );
      } else {
        this.http.post(this.getUrl(), accessory, { headers: header }).subscribe(
          result => {
            const obj = {
              state: 'successful',
              accessoryDsc: this.accessoryDSC,
              id: result['entity'].id,
              driverId: this.form.get('driverId').value,
              trailerId: this.form.get('trailerId').value,
              driverName: this.driverName,
              trailerPlaque: this.trailerPlaque
            };
            this.dialogRef.close(obj);
          },
          (error: any) => {
            console.log('create ');
            console.log(error);
          }
        );
      }
    }
  }

  getUrl() {
    return '/v1/api/DriverAccessory/';
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }
}
