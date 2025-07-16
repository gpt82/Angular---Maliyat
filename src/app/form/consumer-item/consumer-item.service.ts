import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ConsumerItemService {
  private url = '/v1/api/ConsumerItem';

  constructor(private http: HttpClient) { }

  getConsumerItemByName(name: string) {
    return this.http.get<any>(`${this.url}/Name/${name}`);
  }

}

