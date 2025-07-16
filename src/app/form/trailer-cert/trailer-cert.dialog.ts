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
import { DriverDetailDto } from '../driver/dtos/DriverDetailDto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/app-auth-n.service';
import { HashLocationStrategy } from '@angular/common';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'trailer-cert-dialog',
  templateUrl: 'trailer-cert.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class TrailerCertDialog extends ModalBaseClass implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('issueDatePicker') issueDatePicker;
  form: FormGroup;
  public selectedCertItems: number[] = [];

  certItems: any[] = [];
  certDsc = '';

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();
  trailerPlaque = '';

  driversLoading = false;
  drivers$: Observable<Object | any[]>;
  driversInput$ = new Subject<string>();
  driverName = '';

  constructor(
    public dialogRef: MatDialogRef<TrailerCertDialog>,
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
    this.getCertItems();

  }
  getCertItems() {
    const url = '/v1/api/TrailerCertItem';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      this.certItems.push(...result['entityLinkModels'].map(m => m.entity));
      this.selectedCertItems = this.data.Cert.selectedCertItems !== null ? this.data.Cert.selectedCertItems.split(',').map(x => +x) : [];
      // console.log(this.data.Cert.selectedCertItems.split(',').map(x => +x) + 'getCertItems');
    });
  }
  private CreateForm() {
    this.form = this.fb.group(
      {
        driverId: [this.data.Cert.driverId, Validators.required],
        trailerId: [this.data.Cert.trailerId, Validators.required],
        description: this.data.Cert.description || '',
        issueDate: [moment(this.data.Cert.issueDate).locale('fa'), Validators.required],
        selectedCertItems: [this.data.Cert.selectedCertItems],
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
          id: this.data.Cert.driverId,
          title: this.data.Cert.driverTitle
        },
        {
          id: this.data.Cert.guiltyDriverId,
          title: this.data.Cert.guiltyDriverTitle
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
          id: this.data.Cert.trailerId,
          title: this.data.Cert.trailerTitle
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
  // selectedKeysChange(rows: number[]) {
  //   console.log(rows);
  // }
  onChangeDriver(item) {
    if (item !== undefined) {
      this.driverName = item['title'];
      this.trailers$ =
        of([
          {
            id: item['trailerId'],
            title: item['trailerPlaque']
          }
        ]);
      this.form.get('trailerId').setValue(item['trailerId']);
    }
  }
  onChangeTrailer($event) {
    this.trailerPlaque = $event['title'];
  }
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

  onSave(): void {
    if (this.form.valid) {
      this.certDsc = this.certItems.filter((itm) => this.selectedCertItems.indexOf(itm.id) > -1).map(i => i.name).join();
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });

      const cert = JSON.stringify({
        DriverId: this.form.get('driverId').value,
        TrailerId: this.form.get('trailerId').value,
        // Description: this.form.get('description').value || '',
        Description: this.certDsc,
        IssueDate:
          this.form.get('issueDate').value != null
            ? moment
              .from(this.form.get('issueDate').value, 'en')
              .utc(true)
              .toJSON()
            : null,
        SelectedCertItems: this.selectedCertItems.join()// this.form.get('selectedCertItems').value || 0
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getUrl() + this.data.Cert.id, cert, { headers: header })
          .subscribe(
            result => {
              const obj = {
                state: 'successful',
                certDsc: this.certDsc,
                id: result['entity'].id
              };
              this.dialogRef.close(obj);
            },
            (error: any) => {
              console.log('create agent');
              console.log(error);
            }
          );
      } else {
        this.http.post(this.getUrl(), cert, { headers: header }).subscribe(
          result => {
            const obj = {
              state: 'successful',
              certDsc: this.certDsc,
              id: result['entity'].id,
              driverId: this.form.get('driverId').value,
              trailerId: this.form.get('trailerId').value,
              driverName: this.driverName,
              trailerPlaque: this.trailerPlaque
            };
            this.dialogRef.close(obj);
          },
          (error: any) => {
            console.log('create agent');
            console.log(error);
          }
        );
      }
    }
  }

  getUrl() {
    return '/v1/api/TrailerCert/';
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }
}
