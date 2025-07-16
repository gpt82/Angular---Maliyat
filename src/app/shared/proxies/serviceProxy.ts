import { HttpClient, HttpHeaders, HttpResponseBase, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import {EMPTY, Observable, of} from 'rxjs';

import { AppConsts } from '../constants/constants';
import {catchError} from 'rxjs/operators';

export class DataService {
    baseUrl = AppConsts.remoteServiceBaseUrl;
    constructor(private httpClient: HttpClient) { }

    // notice the <T>, making the method generic
    get<T>(url, params): Observable<T> {
        return this.httpClient
            .get<T>(this.baseUrl + url, { params }).pipe(
            // .retry(3) // optionally add the retry
            catchError((err: HttpErrorResponse) => {

                if (err.error instanceof Error) {
                    // A client-side or network error occurred. Handle it accordingly.
                    console.error('An error occurred:', err.error.message);
                } else {
                    // The backend returned an unsuccessful response code.
                    // The response body may contain clues as to what went wrong,
                    console.error(`Backend returned code ${err.status}, body was: ${err.error}`);
                }

                // ...optionally return a default fallback value so app can continue (pick one)
                // which could be a default value
                // return Observable.of<any>({my: "default value..."});
                // or simply an empty observable
                return EMPTY;
            }));
    }
}

export class ServiceProxy {
    private baseUrl: string;
    constructor(private httpClient: HttpClient) {
        this.baseUrl = 'http://localhost:4202/';
    }

    /**
     * @return Success
     **/

    getAll(url): object {
        let url_ = this.baseUrl + url;
        url_ = url_.replace(/[?&]$/, '');
        let res = new Object();
        return this.httpClient.get(url_)
            .subscribe(
                data => console.log('success', data),
                error => console.log('oops', error)
            );
    }

    protected processGetAllCategories(response: HttpResponseBase): Observable<object[]> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
                (<any>response).error instanceof Blob ? (<any>response).error : undefined;

        const _headers: any = {};

        if (response.headers) {
            for (const key of response.headers.keys()) {
                _headers[key] = response.headers.get(key);
            }
        }

        if (status === 200) {
        } else if (status === 401) {
        } else if (status === 403) {
        } else if (status !== 200 && status !== 204) {
        }
        return of<object[]>(<any>null);
    }
}
