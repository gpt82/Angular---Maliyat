// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { ValidationErrors } from '@angular/forms';
// import { FactoryFareDto } from './dtos/FactoryFareDetailDto';
// import { ILookupResultDto } from '@shared/dtos/LookupResultDto';

// @Injectable()
// export class FactoryFareService {
//   private url = '/v1/api/Fare';

//   constructor(private http: HttpClient) {
//   }

//   // getFareByCode(provinceId: number, contractNo: number) {
//   getFareByCode(request: any) {
//     // const obj = {
//     //   provinceId: provinceId,
//     //   contractNo: contractNo
//     // };
//     // const headers = new HttpHeaders({
//     //   filters: JSON.stringify(request)
//     // });
//     // headers.append(
//     //   'Content-Type',
//     //   'application/x-www-form-urlencoded;charset=UTF-8'
//     // );
//     return this.http.get<any>(`${this.url}`); // /getFare/${request.contractNo}/${request.provinceId}
//   }

//   getFare(provinceId: number, contractNo: string) {
//     return this.http.get<any>(`${this.url}/getFare/${contractNo}/${provinceId}`);
//   }

//   getAgendaFare(contractNo: string, agentId: string) {
//     // let params = new HttpParams();
//     // params = params.append('agentId', agentId);
//     // params = params.append('contractNo', contractNo);
//     // const request = JSON.stringify({
//     //     agentId: agentId,
//     //     contractNo: contractNo
//     // });
//     // return this.http.get<any>(`${this.url}/getAgendaFare`);
//     //  this.http.get(`${this.url}/getAgendaFare`, {observe: 'response', params}).subscribe(
//     return this.http.get<any>(`${this.url}/getAgendaFare/${contractNo}/${agentId}`);

//   }

// }
