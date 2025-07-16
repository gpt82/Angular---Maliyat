import { Component, OnInit, ViewChild, Input, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, catchError, map } from 'rxjs/operators';
import * as moment from 'jalali-moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IntlService } from '@progress/kendo-angular-intl';
import { ReportService } from '../../shared/services/report-service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/app-auth-n.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'cash-deposit-dialog',
  templateUrl: 'cash-deposit.dialog.html',

})

export class CashDepositDialog extends ModalBaseClass implements OnInit {

  form: FormGroup;
  @ViewChild('cashDepositDatePicker') cashDepositDatePicker;
  public cashDepositList: any[] = [];
  selectedId: number;

  agendasLoading = false;
  agendas$: Observable<Object | any[]>;
  agendasInput$ = new Subject<string>();

  constructor(
    public intl: IntlService,
    public dialogRef: MatDialogRef<CashDepositDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private router: Router,
    public snackBar: MatSnackBar,
    public authService: AuthService
  ) {
    super();
  }
  ngOnInit() {
    this.loadAgendas();
    this.formBuilder();
    this.cashDepositList = this.data.cashDepositList;
    // const url = '/v1/api/CashDeposit/' + this.data.cashDeposit.agendaIds;
    // const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // this.http.get(url, { headers: headers }).subscribe((result: any[]) => {
    //   const item = result;
    //   this.cashDepositList = result;
    //   console.log(item);
    // });
  }
  formBuilder() {
    this.form = this.fb.group(
      {
        cashDepositNumber: [this.data.cashDeposit.cashDepositNumber, Validators.required, this.uniqueCode.bind(this)],
        registeredDate: [this.data.cashDeposit.registeredDate, Validators.required],
        description: this.data.cashDeposit.description
      },
      { updateOn: 'blur' }
    );
  }
  private loadAgendas() {
    this.agendas$ =
      this.agendasInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.agendasLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/agendas/' + term + '/false').pipe(
            catchError(() => of([])),
            tap(() => (this.agendasLoading = false))
          )
        )
      );
  }

  addAgenda(id: number) {
    const url = '/v1/api/agenda/' + id;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      const item = result['entity'];
      if (item.cashDepositId > 0) {
        this.http.get('/v1/api/cashDeposit/' + item.cashDepositId, { headers: headers }).subscribe(res => {
          const ag = res['entity'];
          alert(` در صورتحساب شماره  ${ag.cashDepositNumber} در تاریخ  ${moment(ag.exportDate).locale('fa').format('YYYY/M/D')} تسویه شد`);
        });
      } else {
        const add = {
          agendaId: item.id,
          agendaNumber: item.waybillNumber + '(' + item.waybillSeries + ')',
          persianExportDate: moment(item.exportDate).locale('fa').format('YYYY/M/D'),
          persianReceivedDate: moment(item.receivedDate).locale('fa').format('YYYY/M/D'),
          agentCode: item.receiverCity,
          driverFullName: item.driverTitle,
          driverBankAccNumber: '',
          trailerPlaque: item.trailerTitle,
          branchTitle: item.branchTitle,
          fare: item.fare,
          preFare: item.preFare,
          reward: item.reward,
          milkRun: item.milkRun,
          remainingFare: item.remainingFare
        };
        this.cashDepositList.push(add);
        this.snackBar.open(
          'با موفقیت به لیست اضافه شد.',
          '',
          {
            duration: 3000,
            panelClass: ['snack-bar-sucsess']
          }
        );
      }
    });
  }

  add2List() {
    if (!this.cashDepositList.find(a => a.agendaId === this.selectedId)) {
      this.addAgenda(this.selectedId);
    } else {
      this.snackBar.open(
        'قبلا در همین لیست وارد کرده اید',
        '',
        {
          duration: 3000,
          panelClass: ['snack-bar-fail']
        }
      );
    }
    this.selectedId = 0;
  }

  public removeHandler(id: number): void {
    const index = this.cashDepositList.findIndex(({ agendaId }) => agendaId === id);
    this.cashDepositList.splice(index, 1);
    this.snackBar.open(
      'با موفقیت از لیست حذف شد.',
      '',
      {
        duration: 3000,
        panelClass: ['snack-bar-info']
      }
    );
  }
  get code() {
    return this.form.get('cashDepositNumber');
  }
  onShowSearchDialog() {

  }
  popUpCalendar1() {
    this.cashDepositDatePicker.open();
  }
  uniqueCode(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    if (ctrl.value === this.data.cashDeposit.cashDepositNumber) { return of(null); }
    return this.http.get(this.getUrl() + 'code/' + ctrl.value).pipe(
      map(codes => {
        return codes ? { uniqueCode: true } : null;
      })
    );
  }
  onSave(): void {
    const header = new HttpHeaders({ 'Content-Type': 'application/json' });

    const cashList = JSON.stringify({
      CashDepositNumber: this.form.get('cashDepositNumber').value,
      RegisteredDate: moment
        .from(this.form.get('registeredDate').value, 'en')
        .utc(true)
        .toJSON(),
      SumFare: this.cashDepositList.map(i => i.fare).reduce((sum, current) => sum + current),
      SumPreFare: this.cashDepositList.map(i => i.preFare).reduce((sum, current) => sum + current),
      SumReward: this.cashDepositList.map(i => i.reward).reduce((sum, current) => sum + current),
      SumMilkRun: this.cashDepositList.map(i => i.milkRun).reduce((sum, current) => sum + current),
      SumRemainingFare: this.cashDepositList.map(i => i.remainingFare).reduce((sum, current) => sum + current),
      total: 0,
      Description: this.form.get('description').value,
      AgendaIds: this.cashDepositList.map(c => c.agendaId).join()
    });
    if (this.data.isEdit === true) {
      this.http
        .put(this.getUrl() + this.data.cashDeposit.id, cashList, { headers: header })
        .subscribe(
          result => {
          },
          (error: any) => {
            console.log('edit chaque');
            console.log(error);
          }
        );
    } else {
      this.http
        .post(this.getUrl(), cashList, { headers: header })
        .subscribe(
          result => {
            this.data.cashDeposit.id = result['entity'].id;
            this.data.isEdit = true;
          },
          (error: any) => {
            console.log('edit chaque');
            console.log(error);
          }
        );
    }
  }
  onClearList() {
    this.cashDepositList = [];
  }
  onListReport() {
    this.onClose();
    const hdr = {
      userName: this.authService.getFullName(),
      DocNo: this.form.get('cashDepositNumber').value,
      DocDate: moment(this.form.get('registeredDate').value)
        .locale('fa').format('YYYY/MM/DD')
    };
    const detailRows = [];
    this.cashDepositList.forEach(row => {
      detailRows.push({
        AgendaNumber: row.agendaNumber,
        PersianReceivedDate: row.PersianReceivedDate !== null ? moment(row.PersianReceivedDate)
          .locale('fa')
          .format('YYYY/MM/DD') : '',
        persianExportDate: row.persianExportDate,
        AgentCode: row.agentCode,
        DriverFullName: row.driverFullName,
        DriverBankAccountNumber: row.driverBankAccountNumber,
        TrailerPlaque: row.trailerPlaque.replace('ایران', '-'),
        // PlaqueForSort: this.swapArray(row.trailerPlaque.replace('ایران', '-').replace('ع').split('-')[0], 0, 1).join(''),
        PlaqueForSort: row.trailerPlaque.replace('ایران', '-').replace('ع'),
        Fare: row.fare,
        PreFare: row.preFare,
        Reward: row.reward,
        RemainingFare: row.remainingFare,
        MilkRun: row.milkRun,
        BranchTitle: row.branchTitle,
        Type: row.type
      });
    });
    this.cashDepositList.map(a => a.PlaqueForSort = a.trailerPlaque.replace('ایران', '-').replace('ع', ''))
    const dataSources = JSON.stringify({
      DetailRows: this.cashDepositList,
      // DetailRows: detailRows,
      ReportTitle: hdr
    });
    ReportService.setReportViewModel({
      reportName: 'CashDeposit.mrt',
      options: null,
      dataSources,
      reportTitle: 'لیست واریز نقدی '
    });

    this.router.navigate(['form/report']);
  }
  getUrl() {
    return '/v1/api/CashDeposit/';
  }
  onClose() {
    this.dialogRef.close({ data: null, state: 'cancel' });
  }

}
