import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import * as moment from 'jalali-moment';
import { Observable } from 'rxjs';
import { ReportService } from '../../shared/services/report-service';
import { AuthService } from '../../core/services/app-auth-n.service';

@Injectable()
export class AgendaService {
  private url = '/v1/api/Agenda';
  CertDsc = '';
  loadingLocations: LoadingLocation[];
  constructor(private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }

    // uploadExcelFile(file: File): Observable<any> {
    //   const formData: FormData = new FormData();
    //   formData.append('file', file, file.name);
  
    //   const headers = new HttpHeaders();
    //   headers.append('Content-Type', 'multipart/form-data');
  
    //   return this.http.post(`${this.apiUrl}/api/file-upload/upload`, formData, { headers });
    // }

  getCarGroupByName(name: string) {
    return this.http.get<any>(`${this.url}/Name/${name}`);
  }

  onAgendaCarsReport(agendaId: number): void {
    if (agendaId > 0) {
      const url = '/v1/api/Report/AgendaCars/' + agendaId;
      this.http.get(url).subscribe(result => {
        const cars = [];
        const agents = [];
        const carTypes = [];

        if (result['cars'] && result['cars'].length > 0) {
          result['cars'].forEach(car => {
            cars.push({
              Owner: car.owner,
              AgentCode: car.agentCode,
              DeliveryAgentCode: car.deliveryAgentCode,
              BuildNumber: car.buildNumber,
              ExternalNumber: car.externalNumber,
              Type: car.type,
              Description: car.description,
              LoadingLocation: car.loadingLocation
            });
          });
          result['agents'].forEach(agent => {
            agents.push({
              code: agent.code,
              name: agent.name,
              address: agent.address,
              phone: agent.phone,
              city: agent.city
            });
          });
          result['carTypes'].forEach(carType => {
            carTypes.push({
              cnt: carType.cnt,
              name: carType.name
            });
          });
        }

        const dataSources = JSON.stringify({
          Car: cars,
          Agent: agents,
          CarType: carTypes,
          PrintAgendaDataSource: {
            CarManufacturerGroupName: result['carManufacturerGroupName'],
            CarManufacturerName: result['carManufacturerName'],
            BranchName: result['branchName'],
            CompanyName: result['companyName'],
            ManufacturerNumber: result['ManufacturerNumber'],
            BranchPhone1: result['branchPhone1'],
            BranchPhone2: result['branchPhone2'],
            UserName: result['userName'],
            TargetProvince: result['targetProvince'],
            TargetCity: result['targetCity'],
            AgentNumber: result['agentNumber'],
            AgendaNumber: result['agendaNumber'],
            ExportDate: moment(result['exportDate'])
              .locale('fa')
              .format('YYYY/M/D    (HH:mm)'),
            CarCount: result['carCount'],
            DriverName: result['driverName'],
            DriverMobile: result['driverMobile'],
            DriverLicenseNumber: result['driverLicenseNumber'],
            TrailerPlaque: result['trailerPlaque'],
            DriverCertNumber: result['driverCertNumber'],
            DriverSmartCardNumber: result['driverSmartCardNumber'],
            WaybillNumber: result['waybillNumber'],
            AgentName: result['agentName'],
            CargoCode: result['cargoCode'],
            Provinces: result['provinces'],
            CurrentPersianDate: moment()
              .locale('fa')
              .format('YYYY/M/D    (HH:mm)')
          }
        });

        ReportService.setReportViewModel({
          reportName: 'DeliveryCarsAgenda.mrt',
          options: null,
          dataSources,
          reportTitle: 'صورت وضعیت حمل'
        });

        this.router.navigate(['form/report']);
      });
    }
  }

  ///////////////////
  public readExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();

      reader.onload = (event: any) => {
        const data: any = event.target.result;
        const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'binary' });
        const sheetName: string = workbook.SheetNames[0];
        const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
        // const excelData: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });
        const excelData: any[] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: null, // Set empty cells to null
          raw: false
        });
        // Send data to the server
        // this.sendDataToServer(excelData)
        //   .subscribe(
        //     (response) => {
        //       console.log('Data sent successfully:', response);
        //       resolve(excelData);
        //     },
        //     (error) => {
        //       console.error('Error sending data to the server:', error);
        //       reject(error);
        //     }
        //   );
      };

      reader.onerror = (event) => {
        reject(event);
      };

      reader.readAsBinaryString(file);
    });
  }

  private sendDataToServer(data: any[]) {
    const url ='' // `${this.apiUrl}/api/excel`; // Adjust the URL based on your API endpoint
    return this.http.post(url, data);
  }


  /////////////////////
}
export class LoadingLocation {
  LoadingLocationId: number;
  TrackingCode: string;
  AgendaId: number;
}
