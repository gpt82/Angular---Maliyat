import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../../core/services/app-auth-n.service';

@Injectable()
export class FareService {
  private url = '/v1/api/Fare';
  // private geteUrl = '/v1/api/GeteFare';

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  // getFareByCode(cityId: number, contractNo: number) {
  getFareByCode(request: any) {
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
    return this.http.get<any>(`${this.url}`); // /getFare/${request.contractNo}/${request.cityId}
  }

  getFare(cityId: number, contractNo: string) {
    const headers = new HttpHeaders();

    let params = new HttpParams();
    params = params.append('cityId', cityId.toString());
    params = params.append('contractNo', contractNo);
    params = params.append('branchId', this.authService.selectedBranchId.toString());
    return this.http.get<any>(`${this.url}/getFare`, { headers, params });
  }
  // getGeteFare(receiverId: number, trailerId: number, fareContract: string, loadingLocationId: number, senderId: number,  tonnageTypeId: number, cityId: number) {
  //   const headers = new HttpHeaders();
  //   let params = new HttpParams();
  //   params = params.append('receiverId', receiverId.toString());
  //   params = params.append('loadingLocationId', loadingLocationId.toString());
  //   params = params.append('senderId', senderId.toString());
  //   params = params.append('trailerId', trailerId.toString());
  //   params = params.append('tonnageTypeId', tonnageTypeId.toString());
  //   params = params.append('cityId', cityId.toString());
  //   params = params.append('fareContract', fareContract);
  //   params = params.append('branchId', this.authService.selectedBranchId.toString());
  //   return this.http.get<any>(`${this.url}/getAgendaGeteFare`, { headers, params });
  // }

  getAgendaFare(contractNo: string, agentId: string) {
    const headers = new HttpHeaders();

    let params = new HttpParams();
    params = params.append('agentId', agentId);
    params = params.append('contractNo', contractNo);
    params = params.append('branchId', this.authService.selectedBranchId.toString());
    // const request = JSON.stringify({
    //     agentId: agentId,
    //     contractNo: contractNo,
    //     branchId: branchId
    // });
    // return this.http.get<any>(`${this.url}/getAgendaFare`);
    //  this.http.get(`${this.url}/getAgendaFare`, {observe: 'response', params}).subscribe(
    return this.http.get<any>(`${this.url}/getAgendaFare`, { headers, params });

  }

}
