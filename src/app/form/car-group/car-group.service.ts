import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CarGroupService {
  private url = '/v1/api/CarGroup';

  constructor(private http: HttpClient) {}

  getCarGroupByName(name: string) {
    return this.http.get<any>(`${this.url}/Name/${name}`);
  }
}
