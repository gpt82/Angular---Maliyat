import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PackagingService {
  private url = '/v1/api/Packaging';

  constructor(private http: HttpClient) {}

  getPackagingByName(name: string) {
    return this.http.get<any>(`${this.url}/Name/${name}`);
  }
}
