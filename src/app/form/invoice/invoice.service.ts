import { Injectable, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ReportService } from '../../shared/services/report-service';
import { Router } from '@angular/router';
import * as moment from 'jalali-moment';
import { Subject } from 'rxjs';

@Injectable()
export class InvoiceService implements OnDestroy {

  // viewer: any = new Stimulsoft.Viewer.StiViewer(null, 'StiViewer', false);
  // report: any = new Stimulsoft.Report.StiReport();
  isInvoice = false;
  url = '/v1/api/Invoice/';
  notifier = new Subject();
  // invoiceAgendaIds$ = new Subject();
  invoiceAgenda: any[] = [];
  selectedagendas: any[] = [];
  // invoiceAmaniIds$ = new Subject();
  invoiceAmani: any[] = [];
  // invoiceRecarIds$ = new Subject();
  invoiceRecar: any[] = [];
  // invoiceSubsidyIds$ = new Subject();
  invoiceSubsidy: any[] = [];
  // invoiceReplaceIds$ = new Subject();
  invoiceReplace: any[] = [];
  // invoiceHavaleIds$ = new Subject();
  invoiceHavale: any[] = [];
  // invoiceAccessoryIds$ = new Subject();
  invoiceAccessory: any[] = [];
  // invoiceFactorIds$ = new Subject();
  invoiceFactor: any[] = [];
  // invoiceSofteIds$ = new Subject();
  invoiceSofte: any[] = [];
  // invoicePenaltyIds$ = new Subject();
  invoicePenalty: any[] = [];
  // invoiceChaqueIds$ = new Subject();
  invoiceChaque: any[] = [];
  // invoiceKafIds$ = new Subject();
  invoiceKaf: any[] = [];
  agendaIds;
  amaniIds;
  recarIds;
  subsidyIds;
  replaceIds;
  havaleIds;
  accessoryIds;
  factorIds;
  softeIds;
  penaltyIds;
  chaqueIds;
  kafIds;
  allIds;
  idsOnEnter = '';
  sumAgendaFare = 0;
  sumAmaniFare = 0;
  sumRecarFare = 0;
  sumSubsidyAmount = 0;
  sumReplaceAmount = 0;
  sumHavaleAmount = 0;
  sumAccessoryAmount = 0;
  sumFactorAmount = 0;
  sumSofteAmount = 0;
  sumPenaltyAmount = 0;
  sumChaqueAmount = 0;
  sumKafRent = 0;
  receivableAmount = 0;
  amountPayable = 0;
  total = 0;
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }
  sumAgenda() {

  }
  sumAmani() {



  }
  sumRecar() {



  }
  sumSubsidy() {



  }
  sumReplace() {



  }
  sumHavale() {



  }
  sumAccessory() {



  }
  sumFactor() {



  }
  sumPenalty() {



  }
  sumKaf() {



  }
  sumChaque() {



  }
  sumSofte() {



  }
  sumAll() {
    this.agendaIds = this.invoiceAgenda.length === 0 ? [] : this.invoiceAgenda.map(i => i.agendaId).join();
    this.sumAgendaFare = this.invoiceAgenda.reduce((acc, val) => acc + val.remainingFare, 0);

    this.amaniIds = this.invoiceAmani.length === 0 ? [] : this.invoiceAmani.map(i => i.amaniId).join();
    this.sumAmaniFare = this.invoiceAmani.reduce((acc, val) => acc + val.fare, 0);

    this.recarIds = this.invoiceRecar.length === 0 ? [] : this.invoiceRecar.map(i => i.recarId).join();
    this.sumRecarFare = this.invoiceRecar.reduce((acc, val) => acc + val.fare, 0);

    this.subsidyIds = this.invoiceSubsidy.length === 0 ? [] : this.invoiceSubsidy.map(i => i.subsidyId).join();
    this.sumSubsidyAmount = this.invoiceSubsidy.reduce((acc, val) => acc + val.amount, 0);

    this.replaceIds = this.invoiceReplace.length === 0 ? [] : this.invoiceReplace.map(i => i.replaceId).join();
    this.sumReplaceAmount = this.invoiceReplace.reduce((acc, val) => acc + val.amount, 0);

    this.havaleIds = this.invoiceHavale.length === 0 ? [] : this.invoiceHavale.map(i => i.havaleId).join();
    this.sumHavaleAmount = this.invoiceHavale.reduce((acc, val) => acc + val.amount, 0);

    this.accessoryIds = this.invoiceAccessory.length === 0 ? [] : this.invoiceAccessory.map(i => i.accessoryId).join();
    this.sumAccessoryAmount = this.invoiceAccessory.reduce((acc, val) => acc + val.amount, 0);

    this.factorIds = this.invoiceFactor.length === 0 ? [] : this.invoiceFactor.map(i => i.factorId).join();
    this.sumFactorAmount = this.invoiceFactor.reduce((acc, val) => acc + val.amount, 0);

    this.penaltyIds = this.invoicePenalty.length === 0 ? [] : this.invoicePenalty.map(i => i.penaltyId).join();
    this.sumPenaltyAmount = this.invoicePenalty.reduce((acc, val) => acc + val.amount, 0);

    this.chaqueIds = this.invoiceChaque.length === 0 ? [] : this.invoiceChaque.map(i => i.id).join();
    this.sumChaqueAmount = this.invoiceChaque.reduce((acc, val) => acc + val.amount, 0);

    this.kafIds = this.invoiceKaf.length === 0 ? [] : this.invoiceKaf.map(i => i.kafRentPaidId).join();
    this.sumKafRent = this.invoiceKaf.reduce((acc, val) => acc + val.rent, 0);
    


    this.softeIds = this.invoiceSofte.map(i => i.softeId).join();
    this.sumSofteAmount = this.invoiceSofte.reduce((acc, val) => acc + val.amount, 0);

    this.allIds = this.agendaIds + 'p' + this.amaniIds + 'p' + this.recarIds + 'p' + this.subsidyIds + 'p' + this.kafIds
      + 'p' + this.penaltyIds + 'p' + this.havaleIds + 'p' + this.accessoryIds + 'p' + this.factorIds + 'p' + this.replaceIds + 'p' + this.softeIds;
    this.total =
      this.sumAgendaFare - this.sumAmaniFare + this.sumRecarFare + this.sumHavaleAmount + this.sumFactorAmount + this.sumReplaceAmount
      - this.sumAccessoryAmount - this.sumSubsidyAmount - this.sumPenaltyAmount - this.sumKafRent - this.sumSofteAmount;

  }

  printPreviewInvoice(invoiceId: number): void {
    const url = this.url + 'PrintInvoice/' + invoiceId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        InvoiceNumber: result['invoiceNumber'],
        CompanyName: result['companyName'],
        // CarManufacturerName: result['carManufacturerName'],
        // CarManufacturerGroupName: result['carManufacturerGroupName'],
        RegisteghredDate: moment(result['registeredDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        // ToDate: moment(result['toDate'])
        //   .locale('fa')
        //   .format('YYYY/MM/DD'),
        Description: result['description'],
        // Code: result['code'],
        // Name: result['name']
      };
      // const branches = [];
      // result['branches'].forEach(row => {
      //   branches.push({
      //     BranchTitle: row.branchTitle,
      //     Count: row.count
      //   });
      // });
      const chaques = [];
      result['chaques'].forEach(row => {
        chaques.push({
          ChaqueNumber: row.chaqueNumber,
          DueDate: row.dueDate !== null ? moment(row.dueDate)
            .locale('fa')
            .format('YYYY/MM/DD') : '',
          DriverName: row.driverName,
          TrailerPlaque: row.trailerPlaque?.replace('ایران', '-'),
          Amount: row.amount,
          BankName: row.bankName
        });
      });
      const detailRows = [];
      const details = result['details'];
      // .sort((a, b) => (a.trailerPlaque.replace(/ع/gi, '') > b.trailerPlaque.replace(/ع/gi, '')) ? 1 :
      //   ((b.trailerPlaque.replace(/ع/gi, '') > a.trailerPlaque.replace(/ع/gi, '')) ? -1 : 0));
      details.forEach(row => {
        detailRows.push({
          AgendaNumber: row.agendaNumber,
          ExportDate: row.exportDate !== null ? moment(row.exportDate)
            .locale('fa')
            .format('YYYY/MM/DD') : '',
          AgentCode: row.agentCode,
          TargetCity: row.targetCity,
          DriverName: row.driverFullName,
          DriverBankAccountNumber: row.driverBankAccountNumber,
          TrailerPlaque: row.trailerPlaque?.replace('ایران', '-'),
          //PlaqueForSort: this.swapArray(row.trailerPlaque.replace('ایران', '-').replace('ع').split('-')[0], 0, 1).join(''),
          PlaqueForSort: row.trailerPlaque?.replace('ایران', '-').replace('ع'),
          Fare: row.fare,
          PreFare: row.preFare,
          Reward: row.reward,
          CarCount: row.carCount,
          RemainingFare: row.remainingFare,
          MilkRun: row.milkRun,
          BranchTitle: row.branchTitle?.replace('شعبه', ''),
          PocketNumber: row.pocketNumber,
          Paidlvl2Number: row.paidlvl2Number,
          Type: row.type
        });
      });
      // detailRows.sort((a, b) => (a.trailerPlaque > b.trailerPlaque) ? 1 :
      //   ((b.trailerPlaque > a.trailerPlaque) ? -1 : 0));
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr,
        ChaqueList: chaques
      });
      ReportService.setReportViewModel({
        reportName: 'Invoice0.mrt',
        options: null,
        dataSources,
        reportTitle: 'صورتحساب  تسویه رانندگان  '
      });

      this.router.navigate(['form/report']);
      // this.dialogRef.close({ state: 'successful' });
    });
  }

  InvoiceBankprint(invoiceId: number): void {
    const url = this.url + 'InvoiceBankPrint/' + invoiceId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        InvoiceNumber: result['invoiceNumber'],
        CompanyName: result['companyName'],
        RegisteghredDate: moment(result['registeredDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        // ToDate: moment(result['toDate'])
        //   .locale('fa')
        //   .format('YYYY/MM/DD'),
        Description: result['description'],
        // Code: result['code'],
        // Name: result['name']
      };

      const detailRows = [];
      const details = result['details'];
      details.forEach(row => {
        detailRows.push({

          AccOwner: row.driverFullName?.trim(),
          AccNumber: row.driverBankAccountNumber?.trim(),
          Fare: row.remainingFare,
          ErjaaId: row.erjaa?.trim(),
          Plaque: row.plaque?.trim(),
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'AgendaBank.mrt',
        options: null,
        dataSources,
        reportTitle: 'گزارش بانک'
      });

      this.router.navigate(['form/report']);
      // this.dialogRef.close({ state: 'successful' });
    });
  }
  swapArray(Array: any, Swap1: number, Swap2: number): any {
    var temp = Array[Swap1];
    Array[Swap1] = Array[Swap2]
    Array[Swap2] = temp
    return Array;
  }
  totalPrint(): void {
    const url = '/v1/api/Report/InvoiceList/';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        FromDate: moment(result['fromDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        ToDate: moment(result['toDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        CompanyName: result['companyName'],
        Description: result['description'],
      };
      const detailRows = [];
      result['details'].forEach(row => {
        detailRows.push({
          InvoiceNumber: row.invoiceNumber,
          RegisteredDate: moment(row.registeredDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          PayTypeName: row.payTypeName,
          SumAgenda: row.sumAgenda,
          SumAmani: row.sumAmani,
          SumRecar: row.sumRecar,
          SumSubsidy: row.sumSubsidy,
          SumHavale: row.sumHavale,
          SumAccessory: row.sumAccessory,
          SumFactor: row.sumFactor,
          SumSoft: row.sumSofte,
          SumPenalty: row.sumPenalty,
          SumRent: row.sumRent,
          Total: row.total,
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'InvoiceList.mrt',
        options: null,
        dataSources,
        reportTitle: 'لیست صورتحساب'
      });

      this.router.navigate(['form/report']);
      // this.dialogRef.close({ state: 'successful' });
    });
  }
  loadInvoiceItems(invoiceId: number) {
    const url = '/v1/api/Invoice/InvoiceItems/' + invoiceId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      this.invoiceAgenda.unshift(...result['invoiceAgenda']);
      // this.agendaIds = this.invoiceAgenda.length === 0 ? [] : this.invoiceAgenda.map(i => i.agendaId).join();
      this.invoiceAmani.unshift(...result['invoiceAmani']);
      // this.amaniIds = this.invoiceAmani.length === 0 ? [] : this.invoiceAmani.map(i => i.amaniId).join();
      this.invoiceRecar.unshift(...result['invoiceRecar']);
      // this.recarIds = this.invoiceRecar.length === 0 ? [] : this.invoiceRecar.map(i => i.recarId).join();
      this.invoiceSubsidy.unshift(...result['invoiceSubsidy']);
      // this.subsidyIds = this.invoiceSubsidy.length === 0 ? [] : this.invoiceSubsidy.map(i => i.subsidyId).join();
      this.invoiceReplace.unshift(...result['invoiceReplace']);
      // this.replaceIds = this.invoiceReplace.length === 0 ? [] : this.invoiceReplace.map(i => i.replaceId).join();
      this.invoiceHavale.unshift(...result['invoiceHavale']);
      // this.havaleIds = this.invoiceHavale.length === 0 ? [] : this.invoiceHavale.map(i => i.havaleId).join();
      this.invoiceAccessory.unshift(...result['invoiceAccessory']);
      // this.accessoryIds = this.invoiceAccessory.length === 0 ? [] : this.invoiceAccessory.map(i => i.accessoryId).join();
      this.invoiceFactor.unshift(...result['invoiceFactor']);
      // this.factorIds = this.invoiceFactor.length === 0 ? [] : this.invoiceFactor.map(i => i.factorId).join();
      this.invoicePenalty.unshift(...result['invoicePenalty']);
      // this.penaltyIds = this.invoicePenalty.length === 0 ? [] : this.invoicePenalty.map(i => i.penaltyId).join();
      this.invoiceChaque.unshift(...result['invoiceChaque']);
      // this.chaqueIds = this.invoiceChaque.length === 0 ? [] : this.invoiceChaque.map(i => i.chaqueId).join();
      this.invoiceKaf.unshift(...result['invoiceKaf']);
      // this.kafIds = this.invoiceKaf.length === 0 ? [] : this.invoiceKaf.map(i => i.KafId).join();
      this.invoiceSofte.unshift(...result['invoiceSofte']);
      // this.softeIds = this.invoiceSofte.length === 0 ? [] : this.invoiceSofte.map(i => i.softeId).join();
      // this.idsOnEnter =
      //   this.agendaIds + 'p' + this.amaniIds + 'p' + this.recarIds + 'p' + this.subsidyIds + 'p' + this.kafIds
      //   + 'p' + this.penaltyIds + 'p' + this.havaleIds + 'p' + this.accessoryIds + 'p' + this.factorIds + 'p' + this.replaceIds + 'p' + this.softeIds;
      // this.init();
      this.sumAll();
    });
  }
  loadTrailerItems(trailerId: number) {
    const url = '/v1/api/Invoice/trailerId/' + trailerId;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.get(url, { headers: headers }).subscribe(result => {
      this.invoiceAgenda.unshift(...result['trailerAgenda']);
      // this.agendaIds = this.invoiceAgenda.length === 0 ? [] : this.invoiceAgenda.map(i => i.agendaId).join();
      this.invoiceAmani.unshift(...result['trailerAmani']);
      // this.amaniIds = this.invoiceAmani.length === 0 ? [] : this.invoiceAmani.map(i => i.amaniId).join();
      this.invoiceRecar.unshift(...result['trailerRecar']);
      // this.recarIds = this.invoiceRecar.length === 0 ? [] : this.invoiceRecar.map(i => i.recarId).join();
      this.invoiceSubsidy.unshift(...result['trailerSubsidy']);
      // this.subsidyIds = this.invoiceSubsidy.length === 0 ? [] : this.invoiceSubsidy.map(i => i.subsidyId).join();
      this.invoiceReplace.unshift(...result['trailerReplace']);
      // this.replaceIds = this.invoiceReplace.length === 0 ? [] : this.invoiceReplace.map(i => i.replaceId).join();
      this.invoiceHavale.unshift(...result['trailerHavale']);
      // this.havaleIds = this.invoiceHavale.length === 0 ? [] : this.invoiceHavale.map(i => i.havaleId).join();
      this.invoiceAccessory.unshift(...result['trailerAccessory']);
      // this.accessoryIds = this.invoiceAccessory.length === 0 ? [] : this.invoiceAccessory.map(i => i.accessoryId).join();
      this.invoiceFactor.unshift(...result['trailerFactor']);
      // this.factorIds = this.invoiceFactor.length === 0 ? [] : this.invoiceFactor.map(i => i.factorId).join();
      this.invoicePenalty.unshift(...result['trailerPenalty']);
      // this.penaltyIds = this.invoicePenalty.length === 0 ? [] : this.invoicePenalty.map(i => i.penaltyId).join();
      // this.invoiceKaf.unshift(...result['trailerKaf']);
      this.invoiceSofte.unshift(...result['trailerSofte']);
      // this.softeIds = this.invoiceSofte.length === 0 ? [] : this.invoiceSofte.map(i => i.softeId).join();
      // this.kafIds = this.invoiceKaf.map(i => i.kafId).join();
      // this.idsOnEnter = '';
      // this.allIds = this.agendaIds + 'p' + this.amaniIds + 'p' + this.recarIds + 'p' + this.subsidyIds + 'p' + this.kafIds
      //   + 'p' + this.penaltyIds + 'p' + this.havaleIds + 'p' + this.accessoryIds + 'p' + this.factorIds + 'p' + this.replaceIds + 'p' + this.softeIds;
      this.sumAll();
    });
  }
  // ifFormChanged(): boolean {
  //   if (this.allIds.length > 0) {
  //     const ids: string[] = this.idsOnEnter.split('p');

  //     const isEqual =
  //       (JSON.stringify(ids[0].split(',').sort()) === JSON.stringify(this.agendaIds.split(',').sort())) &&
  //       (JSON.stringify(ids[1].split(',').sort()) === JSON.stringify(this.amaniIds.split(',').sort())) &&
  //       (JSON.stringify(ids[2].split(',').sort()) === JSON.stringify(this.recarIds.split(',').sort())) &&
  //       (JSON.stringify(ids[3].split(',').sort()) === JSON.stringify(this.subsidyIds.split(',').sort())) &&
  //       (JSON.stringify(ids[4].split(',').sort()) === JSON.stringify(this.penaltyIds.split(',').sort())) &&
  //       // (JSON.stringify(ids[5].split(',').sort()) === JSON.stringify(this.chaqueIds.split(',').sort())) &&
  //       (JSON.stringify(ids[5].split(',').sort()) === JSON.stringify(this.kafIds.split(',').sort())) &&
  //       (JSON.stringify(ids[6].split(',').sort()) === JSON.stringify(this.havaleIds.split(',').sort())) &&
  //       (JSON.stringify(ids[7].split(',').sort()) === JSON.stringify(this.accessoryIds.split(',').sort())) &&
  //       (JSON.stringify(ids[8].split(',').sort()) === JSON.stringify(this.factorIds.split(',').sort())) &&
  //       (JSON.stringify(ids[9].split(',').sort()) === JSON.stringify(this.softeIds.split(',').sort()));
  //     // const s = this.form.dirty || !isEqual;
  //     return !isEqual;
  //   }
  //   return false;
  // }
  // isNewAddedList() {
  //   const i1 = this.idsOnEnter.split('p')[0];
  //   const i2 = this.allIds.split('p')[0];
  //   // this.selectedagendas = i2.split(',').map(Number).filter(x => !i1.split(',').map(Number).includes(x));
  //   this.selectedagendas = i2.split(',').filter(x => !i1.split(',').includes(x)).map(x => +x);

  // }
  getUrl() {
    throw new Error('Method not implemented.');
  }
  ngOnDestroy(): void {
    this.notifier.next();
    this.notifier.complete();
    this.sumAgendaFare = 0;
    this.sumAmaniFare = 0;
    this.sumRecarFare = 0;
    this.sumSubsidyAmount = 0;
    this.sumReplaceAmount = 0;
    this.sumHavaleAmount = 0;
    this.sumAccessoryAmount = 0;
    this.sumFactorAmount = 0;
    this.sumSofteAmount = 0;
    this.sumPenaltyAmount = 0;
    this.sumChaqueAmount = 0;
    this.sumKafRent = 0;
    this.receivableAmount = 0;
    this.amountPayable = 0;
    this.total = 0;
  }
}
