import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class GoodsService {
  private url = '/v1/api/Goods';

  constructor(private http: HttpClient) { }

  getGoodsByName(name: string) {
    return this.http.get<any>(`${this.url}/Name/${name}`);
  }

  getGoodsByCode(code: string) {
    return this.http.get<any>(`${this.url}/Code/${code}`);
  }
}

