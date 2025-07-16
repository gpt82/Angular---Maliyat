import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'jalali-moment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../../core/services/app-auth-n.service';
import { IntlService } from '@progress/kendo-angular-intl';
import { GridService } from '../../shared/services/grid.service';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';


import * as Models from '../../shared/_models/persian-date';
import * as Interfaces from '../../shared/_interfaces/persian-date';
import { ReportService } from '../../shared/services/report-service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'trailer-activity',
  templateUrl: './trailer-activity.component.html',
})
export class TrailerActivityComponent {

  trailersLoading = false;
  trailers$: Observable<Object | any[]>;
  trailersInput$ = new Subject<string>();

  public view: Observable<GridDataResult>;
  service: GridService;
  trailerId;
  dataList;
  public fromDate: Interfaces.PersianDate;
  public toDate: Interfaces.PersianDate;

  constructor(
    public intl: IntlService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService) {
    this.loadTrailers();
    // this.fillGrid();
    this.fromDate = new Models.PersianDate(
      +moment(moment().locale('fa'))
        .locale('fa')
        .format('YYYY'),
      +moment(moment().locale('fa'))
        .locale('fa')
        .format('MM') - 1, 1);
    this.toDate = new Models.PersianDate(+moment(moment().locale('fa'))
      .locale('fa')
      .format('YYYY'),
      +moment(moment().locale('fa'))
        .locale('fa')
        .format('MM'), 30);
  }


  private loadTrailers() {
    this.trailers$ =
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
      );
  }
  onDriverAct() {
    const headers = new HttpHeaders();
    const url = '/v1/api/Invoice/driverActivity/';
    let params = new HttpParams();
    if (this.trailerId) {
      params = params.append('trailerId', this.trailerId.id.toString());
    }
    params = params.append('fromDate', moment.from(this.fromDate.toString(), 'fa')
      .utc(true).toJSON());
    params = params.append('toDate', moment.from(this.toDate.toString(), 'fa')
      .utc(true).toJSON());
    this.view = this.http.get(url, { headers, params }).pipe(
      map(
        response => {
          this.dataList = response['entityLinkModels'].map(m => m.entity);
          return <GridDataResult>{
            data: response['entityLinkModels'],
            total: parseInt(response['totalCount'], 10)
          };
        }
      ));
  }
  onListReport() {

    const hdr = {
      fromDate: this.fromDate.toString(),
      toDate: this.toDate.toString()
    };
    const dataSources = JSON.stringify({
      DetailRows: this.dataList,
      ReportTitle: hdr
    });
    ReportService.setReportViewModel({
      reportName: 'DriverActivity.mrt',
      options: null,
      dataSources,
      reportTitle: 'صورتحساب مالی رانندگان '
    });

    this.router.navigate(['form/report']);
  }
  onCreate(): void {
    throw new Error('Method not implemented.');
  }
  onEdit(trailerId: number): void {
    // const dialogRef = this.dialog.open(TrailerActivityDialog, {
    //   width: '1100px',
    //   height: '700px',
    //   disableClose: true,
    //   data: {

    //     trailerId: trailerId,
    //     dialogTitle: ''
    //   }
    // });
    // dialogRef.afterClosed().subscribe(result1 => {
    //   if (result1 && result1.state === 'successful') {
    //     // this.fillGrid();
    //   }
    // });

  }
  getUrl(): string {
    throw new Error('Method not implemented.');
  }
  onClose(): void {
  }
}

