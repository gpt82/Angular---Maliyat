import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class TrailerFareService {
  private url = '/v1/api/TrailerFare';

  constructor(private http: HttpClient) {
  }

  // getTrailerFareByCode(cityId: number, contractNo: number) {
  getTrailerFareByCode() {
    // const obj = {
    //   cityId: cityId,
    //   contractNo: contractNo
    // };
    // const headers = new HttpHeaders({
    //   filters: JSON.stringify(request)
    // });
    // headers.append(
    //   'Content-Type',
    //   'application/x-www-form-urlencoded;charset=UTF-8'
    // );
    return this.http.get<any>(`${this.url}`); // /getTrailerFare/${request.contractNo}/${request.cityId}
  }

  getTrailerFare(cityId: number, tonnageTypeId: number, contractNo: string, senderId: number) {
    return this.http.get<any>(`${this.url}/isExist/${contractNo}/${cityId}/${tonnageTypeId}/${senderId}`);
  }

  getAgendaTrailerFare(contractNo: string, tonnageTypeId: number) {
    // let params = new HttpParams();
    // params = params.append('agentId', agentId);
    // params = params.append('contractNo', contractNo);
    // const request = JSON.stringify({
    //     agentId: agentId,
    //     contractNo: contractNo
    // });
    // return this.http.get<any>(`${this.url}/getAgendaTrailerFare`);
    //  this.http.get(`${this.url}/getAgendaTrailerFare`, {observe: 'response', params}).subscribe(
    return this.http.get<any>(`${this.url}/getAgendaTrailerFare/${contractNo}/${tonnageTypeId}`);

  }

}
