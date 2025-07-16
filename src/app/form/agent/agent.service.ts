import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
// tslint:disable-next-line: class-name
export class AgentService {
  private url = '/v1/api/Agent';

  constructor(private http: HttpClient) {}

  getAgentByCode(code: string) {
    return this.http.get<any>(`${this.url}/Code/${code}`);
  }
}
