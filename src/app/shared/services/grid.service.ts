import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Observable, BehaviorSubject } from 'rxjs';
import { AppConsts } from '../constants/constants';
import { map } from 'rxjs/operators';

@Injectable()
export class GridService extends BehaviorSubject<GridDataResult> {
  httpClient: HttpClient;
  baseUrl: string;
  constructor(private http: HttpClient) {
    super(null);
    this.httpClient = http;
    this.baseUrl = AppConsts.remoteServiceBaseUrl;
  }

  public query(state: any, url: string): void {
    this.queryGridData(state, url);
  }
  private queryGridData(state: any, url: string): void {
    url = url;

    this.fetch(url, state).subscribe(x => super.next(x));
  }
  private fetch(url: string, state: any): Observable<GridDataResult> {
    state.dontShowSnak = true;
    // return this.http.get(url, state).pipe(
    //   map(
    //     response => {
    //       let s = response['entityLinkModels'];
    //       console.log(s);
    //       let p = <GridDataResult>{
    //         data: s.map(s => s.entity),
    //         total: parseInt(response['totalCount'], 10)
    //       };
    //       console.log(p);
    //       return p;
    //     }
    //   ));
    return this.http.get(url, state).pipe(
      map(
        response =>
          <GridDataResult>{
            data: response['entityLinkModels'],
            total: parseInt(response['totalCount'], 10)
          }
      ));
  }
  private getParams(param) {
    const params: URLSearchParams = new URLSearchParams();
    for (const key in param) {
      if (param.hasOwnProperty(key)) {
        const val = param[key];
        params.set(key, val);
      }
    }
    return params;
  }
}
