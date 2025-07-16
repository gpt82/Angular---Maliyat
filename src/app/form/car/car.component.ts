import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CarDialog } from './car.dialog';
import * as moment from 'jalali-moment';

// import { CarDto } from './dtos/CarDto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GridBaseClass } from '../../shared/services/grid-base-class';
import { ExitCarDialog } from './exit-car.dialog';
import { AuthService } from '../../core/services/app-auth-n.service';
import { Router } from '@angular/router';
import { ReportService } from '../../shared/services/report-service';
import { CarDetailDto } from './dtos/CarDetailDto';
import { CarService } from './car.service';
import { State } from '@progress/kendo-data-query';
// import { AmaniDto } from '../amani/dtos/AmaniDto';
import { AmaniDialog } from '../amani/amani.dialog';
import { RolesConstants } from '../../shared/constants/constants';
import { AgendaService } from '../agenda/agenda.service';
const Normalize = data =>
  data.filter((x, idx, xs) => xs.findIndex(y => y.title === x.title) === idx);

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'car-component',
  templateUrl: './car.component.html',
  providers: [HttpClient]
})
export class CarComponent extends GridBaseClass implements OnInit {
  isEdit = false;
  showFilter = 'false';
  showShipped = false;
  provinces: any[] = [];
  public branches: any[];
  data4Buttons: Array<any> = [
    {
      text: 'گزارش سواریهای نمایندگی',
      click: () => {
        this.onAgentCarsReport();
      }
    },
    {
      text: 'گزارش به تفکیک نمایندگی',
      click: () => {
        this.onCarPerAgentsReport();
      }
    },
    {
      text: 'گزارش به تفکیک شهر',
      click: () => {
        this.onCarPerCityReport();
      }
    },
    {
      text: 'گزارش نوع سواری به تفکیک استان',
      click: () => {
        this.onCartypePerProvinceReport();
      }
    },
    {
      text: 'گزارش گروه سواری به تفکیک استان',
      click: () => {
        this.onCarGroupPerProvinceReport();
      }
    }
  ];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    public snackBar: MatSnackBar,
    private http: HttpClient,
    public authService: AuthService,
    private agendaService: AgendaService
  ) {
    super(http, '/v1/api/Car/', dialog);
    this.gridName = 'carGrid';
    const gridSettings: State = this.getState();

    if (gridSettings !== null) {
      this.state = gridSettings;
    }
    this.fillGrid();
  }

  ngOnInit() {
    this.getLookups();
  }

  getLookups(): void {
    this.http
      .get('/v1/api/Lookup/branchs')
      .subscribe(result => (this.branches = Normalize(result)));
  }

  getRowClass({ dataItem, index }) {
    if (!dataItem) {
      return '';
    }

    return {
      shipped: dataItem.entity.isSent,
      '': !dataItem.entity.isSent
    };
  }

  fillGrid() {
    super.applyGridFilters(
      this.showShipped ? '/v1/api/Car/sent/' + this.showShipped : ''
    );
    this.view = this.service;
  }

  onCreate(): void {
    const currentDate = moment();
    const car = new CarDetailDto(null);
    const dialogRef = this.dialog.open(CarDialog, {
      width: '700px',
      height: '550px',
      disableClose: true,
      data: {
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D',
          showGoToCurrent: 'true'
        },
        Car: car,
        registeredDate: currentDate.locale('fa'),
        dialogTitle: 'ایجاد',
        isEdit: false
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }

  onEdit(id: number): void {
    this.getEntity(id).subscribe(result => {
      const car = new CarDetailDto(result['entity']);
      const dialogRef = this.dialog.open(CarDialog, {
        width: '700px',
        height: '550px',
        disableClose: true,
        data: {
          Car: car,
          datePickerConfig: {
            drops: 'down',
            format: 'YY/M/D',
            showGoToCurrent: 'true'
          },
          registeredDate: car.registeredDate
            ? moment(car.registeredDate).locale('fa')
            : moment().locale('fa'),
          dialogTitle: 'ویرایش سواری',
          isEdit: true
        }
      });
      // tslint:disable-next-line:no-shadowed-variable
      dialogRef.afterClosed().subscribe(result => {
        const headers1 = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        if (result && result.state === 'successful') {
          this.fillGrid();
        }
      });
    });
  }

  onDeleteById(id): void {
    this.deleteEntity(id);
  }
  onAgendaDetail(){
    const agendaId = this.selectedRowIds[0].entity.agendaId;
    this.agendaService.onAgendaCarsReport(agendaId);

  }
  onMakeDeposit(): void {
    this.getEntity(this.selectedRowIds[0].entity.id).subscribe(result => {
      this.selectedRowIds = [];
      const data21 = new CarDetailDto(result['entity']);
      if (data21 == null) {
        return;
      }
      const currentDate = moment();
      const amani = {
        carId: data21.id,
        amaniNo: '',
        description: '',
        amaniDate: currentDate.locale('fa')
      };
      // const amani1 = new AmaniDto(amani);
      if (data21.state === 7) {
        this.snackBar.open(
          'سواری مورد نظر قبلا در وضعیت امانی قرار گرفته است',
          'خطا',
          {
            duration: 3000,
            panelClass: ['snack-bar-info']
          }
        );
        return;
      }
      const dialogRef = this.dialog.open(AmaniDialog, {
        width: '600px',
        height: '550px',
        disableClose: true,
        data: {
          datePickerConfig: {
            drops: 'down',
            format: 'YY/M/D',
            showGoToCurrent: 'true'
          },
          // Amani: amani1,
          dialogTitle: 'امانی کردن سواری'
        }
      });

      dialogRef.afterClosed().subscribe(() => {
        // if (result && result.state === 'successful') {
        //   this.fillGrid();
        // }
      });
    });
  }

  onExitCar(): void {
    const data = this.selectedRowIds[0].entity;
    if (data == null) {
      return;
    }

    if (data.state === 1) {
      this.snackBar.open('امکان تغییر وضعیت سواری از وضعیت فعلی نیست', 'خطا', {
        duration: 3000,
        panelClass: ['snack-bar-info']
      });
      return;
    }

    const currentDate = moment();

    const dialogRef = this.dialog.open(ExitCarDialog, {
      width: '350px',
      height: '500px',
      disableClose: true,
      data: {
        datePickerConfig: {
          drops: 'down',
          format: 'YY/M/D',
          showGoToCurrent: 'true'
        },
        id: data.id,
        receiverFirstName: '',
        receiverLastName: '',
        description: '',
        exitDate: currentDate.locale('fa'),
        dialogTitle: 'خروج سواری'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.state === 'successful') {
        this.fillGrid();
      }
    });
  }

  onAgentCarsReport(): void {
    const url = '/v1/api/Report/AgentCars/';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        BranchName: result['branchName'],
        CompanyName: result['companyName'],
        CarManufacturerName: result['carManufacturerName'],
        CarManufacturerGroupName: result['carManufacturerGroupName'],
        FromDate: moment(result['fromDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        ToDate: moment(result['toDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        Description: result['description'],
        Code: result['code'],
        Name: result['name']
      };
      const detailRows = [];
      result['details'].forEach(row => {
        detailRows.push({
          BodyNumber: row.bodyNumber,
          RegisteredDate: moment(row.registeredDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          ExitDate:
            row.exitDate == null
              ? ' '
              : moment(row.exitDate)
                  .locale('fa')
                  .format('YYYY/MM/DD'),
          Owner: row.owner,
          CarType: row.carType
        });
      });
      const dataSources = JSON.stringify({
        DetailRows: detailRows,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'AgentCars.mrt',
        options: null,
        dataSources,
        reportTitle: 'گزارش سواریهای نمایندگی '
      });

      this.router.navigate(['form/report']);
    });
  }

  onCarPerAgentsReport(): void {
    const url = '/v1/api/Report/CarsPerAgent/';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        BranchName: result['branchName'],
        CompanyName: result['companyName'],
        FromDate: moment(result['fromDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        ToDate: moment(result['toDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        Description: result['description']
      };
      const agentHeader = [];
      result['agents'].forEach(row => {
        agentHeader.push({
          Code: row.code,
          Title: row.title,
          City: row.city,
          Province: row.province
        });
      });
      const carDetail = [];
      result['details'].forEach(row => {
        carDetail.push({
          BodyNumber: row.bodyNumber,
          RegisteredDate: moment(row.registeredDate)
            .locale('fa')
            .format('YYYY/MM/DD'),
          CarType: row.carType,
          AgentCode: row.agentCode
        });
      });
      const dataSources = JSON.stringify({
        CarDetail: carDetail,
        ReportTitle: hdr,
        AgentHeader: agentHeader
      });
      ReportService.setReportViewModel({
        reportName: 'CarsPerAgent.mrt',
        options: null,
        dataSources,
        reportTitle: 'گزارش سواریها به تفکیک نمایندگی '
      });

      this.router.navigate(['form/report']);
    });
  }

  onCarPerCityReport(): void {
    const url = '/v1/api/Report/CarsPerCity/';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        BranchName: result['branchName'],
        CompanyName: result['companyName'],
        FromDate: moment(result['fromDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        ToDate: moment(result['toDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        Description: result['description']
      };
      const provinces = [];
      result['provinces'].forEach(row => {
        provinces.push({
          ProvinceName: row.provinceName,
          Count: row.count
        });
      });
      const cityDetail = [];
      result['details'].forEach(row => {
        cityDetail.push({
          CityName: row.cityName,
          ProvinceName: row.provinceName,
          Count: row.count
        });
      });
      const dataSources = JSON.stringify({
        Provinces: provinces,
        CityDetail: cityDetail,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'CarsPerCity.mrt',
        options: null,
        dataSources,
        reportTitle: 'گزارش سواریها به تفکیک شهر '
      });

      this.router.navigate(['form/report']);
    });
  }

  onCartypePerProvinceReport(): void {
    const url = '/v1/api/Report/CartypePerProvince/';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        BranchName: result['branchName'],
        CompanyName: result['companyName'],
        FromDate: moment(result['fromDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        ToDate: moment(result['toDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        Description: result['description']
      };
      const provinces = [];
      result['provinces'].forEach(row => {
        provinces.push({
          ProvinceName: row.provinceName,
          Count: row.count
        });
      });
      const carTypeDetail = [];
      result['details'].forEach(row => {
        carTypeDetail.push({
          CarTypeName: row.carTypeName,
          ProvinceName: row.provinceName,
          Count: row.count
        });
      });
      const dataSources = JSON.stringify({
        Provinces: provinces,
        CarTypeDetail: carTypeDetail,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'CarTypePerProvince.mrt',
        options: null,
        dataSources,
        reportTitle: 'گزارش نوع سواری به تفکیک استان '
      });

      this.router.navigate(['form/report']);
    });
  }
  onCarGroupPerProvinceReport(): void {
    const url = '/v1/api/Report/CarGroupPerProvince/';

    const headers = this.getGridFilterHeader();
    this.http.get(url, { headers: headers }).subscribe(result => {
      const hdr = {
        BranchName: result['branchName'],
        CompanyName: result['companyName'],
        FromDate: moment(result['fromDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        ToDate: moment(result['toDate'])
          .locale('fa')
          .format('YYYY/MM/DD'),
        Description: result['description']
      };
      const provinces = [];
      result['provinces'].forEach(row => {
        provinces.push({
          ProvinceName: row.provinceName,
          Count: row.count
        });
      });
      const carTypeDetail = [];
      result['details'].forEach(row => {
        carTypeDetail.push({
          CarTypeName: row.carGroupName,
          ProvinceName: row.provinceName,
          Count: row.count
        });
      });
      const dataSources = JSON.stringify({
        Provinces: provinces,
        CarTypeDetail: carTypeDetail,
        ReportTitle: hdr
      });
      ReportService.setReportViewModel({
        reportName: 'CarTypePerProvince.mrt',
        options: null,
        dataSources,
        reportTitle: 'گزارش گروه سواری به تفکیک استان '
      });

      this.router.navigate(['form/report']);
    });
  }

  getUrl() {
    return '/v1/api/Car/';
  }

  onClose(): void {}
}
