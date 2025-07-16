import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AccessoryService {
  private url = '/v1/api/Accessory';

  constructor(private http: HttpClient) { }

  getAccessoryByName(name: string) {
    return this.http.get<any>(`${this.url}/Name/${name}`);
  }

}

