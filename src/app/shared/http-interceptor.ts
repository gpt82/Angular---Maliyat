import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { AppConsts, TokenNameConstants } from './constants/constants';
// import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../core/services/app-auth-n.service';
import { NgProgress } from 'ngx-progressbar';
import { ErrorDialog } from './dialogs/Error/error.dialog';
import { LoadingBarService } from '@ngx-loading-bar/core';

export interface IAjaxResponse {
  success: boolean;

  result?: any;

  targetUrl?: string;

  error?: IErrorInfo;

  unAuthorizedRequest: boolean;

  __abp: boolean;
}
export interface IValidationErrorInfo {
  message: string;

  members: string[];
}

export interface IErrorInfo {
  code: number;

  message: string;

  details: string;

  validationErrors: IValidationErrorInfo[];
}

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  baseUrl: string;
  constructor(
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    // private spinner: NgxSpinnerService,
    // public ngProgress: NgProgress,
    private loadingBar: LoadingBarService,
    private authService: AuthService
  ) {
    this.baseUrl = AppConsts.appBaseUrl;
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const interceptObservable = new Subject<HttpEvent<any>>();
    req = req.clone({
      headers: req.headers.set('Accept', 'application/json; charset=UTF-8')
    });
    req = req.clone({
      url:
        req.url.indexOf(AppConsts.remoteServiceBaseUrl) >= 0 ||
        req.url.indexOf('.json') >= 0
          ? req.url
          : AppConsts.remoteServiceBaseUrl + req.url
    });

    if (req.url.indexOf('.json') < 0) {
      const authorizationToken = localStorage.getItem(
        TokenNameConstants.accessTokenKey
      );
      if (authorizationToken === '') {
        this.authService.startAuthentication();
      } else if (this.authService.isTokenExpired(authorizationToken)) {
        this.authService.renewToken();
      }

      req = req.clone({ setHeaders: { Authorization: authorizationToken } });
      setTimeout(() => {
        /*Your Code*/
      }, 900);
      // this.spinner.show();
      // this.ngProgress.start();
    this.loadingBar.start();
    }

    next.handle(req).subscribe(
      (event: HttpEvent<any>) => {
        this.parseSuucessCommandResult(req);

        this.handleSuccessResponse(event, interceptObservable, req);
      },
      (error: any) => {
        this.parseHttpErrorResponseMessage(error);
      }
    );

    return interceptObservable;
  }
  parseSuucessCommandResult(req: any): void {
    if (req.status === 204) {
      return;
    }
    if (req.method === 'POST') {
      this.showSuccessMessage('موجودیت جدید با موفقیت ایجاد شد');
    } else if (req.method === 'PUT') {
      this.showSuccessMessage('اطلاعات با موفقیت ویرایش شد');
    } else if (req.method === 'DELETE') {
      this.showSuccessMessage('موجودیت مورد نظر با موفقیت حذف گردید');
    }
  }
  showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'پیغام', {
      duration: 3000,
      panelClass: ['snack-bar-sucsess']
    });
  }
  parseHttpErrorResponseMessage(error: any): void {
    // this.spinner.hide();
    // this.ngProgress.done();
        this.loadingBar.complete();
    if (
      error.message.indexOf('Http failure response for') !== -1 &&
      error.statusText === 'Unknown Error'
    ) {
      console.log(error);
      this.showFailedMessage(
        'در اجرای درخواست خطایی رخ داده است. مجددا تلاش بفرمائید.'
      );
    } else if (error.error !== undefined) {
      if (typeof error.error === 'string') {
        console.log(error.error);
        this.showFailedMessage(error.error);
      } else if (!error.error.succeeded) {
        if (error.error.aggregatedExceptions) {
          console.log(error.error.aggregatedExceptions);
        }
        if (error.error.message) {
          console.log(error.error.message);
          this.showFailedMessage(error.error.message);
        } else if (error.status === 500) {
          this.showFailedMessage(
            'اجرای درخواست در سمت سرور با خطا مواجه شده است'
          );
        } else {
          this.showFailedMessage('خطایی رخ داده است');
        }
      }
    } else if (error.name === 'HttpErrorResponse') {
      console.log(error);
      switch (error.status) {
        case 401:
          this.showFailedMessage(
            'شما دسترسی لازم برای اجرای این دستور را ندارید' +
              ' error code = 401'
          );
          break;
        case 403:
          this.showFailedMessage(
            'شما دسترسی لازم برای اجرای این دستور را ندارید' +
              ' error code = 403'
          );
          break;
        case 404:
          this.showFailedMessage('متد مورد نظر یافت نشد');
          break;
        default:
          this.showFailedMessage(error.message);
          break;
      }
    }
  }
  showFailedMessage(message): void {
    if (message) {
      this.snackBar.open('خطا', message, {
        duration: 3000,
        panelClass: ['snack-bar-fail']
      });
    }
  }

  protected handleSuccessResponse(
    event: HttpEvent<any>,
    interceptObservable: Subject<HttpEvent<any>>,
    req: HttpRequest<any>
  ): void {
    if (event instanceof HttpResponse) {
      // this.spinner.hide();
      // this.ngProgress.done();
        this.loadingBar.complete();

      if (
        event.body !== null &&
        event.body['success'] === true &&
        (req.method === 'POST' ||
          req.method === 'PUT' ||
          req.method === 'DELETE') &&
        (req.body === null || req.body['dontShowSnak'] !== true)
      ) {
        this.snackBar.open('عملیات با موفقیت ذخیره شد', 'پیغام', {
          duration: 3000,
          panelClass: ['snack-bar-sucsess']
        });
      }
      if (event.body['success'] === false) {
        this.dialog.open(ErrorDialog, {
          disableClose: true,
          height: '350px',
          data: {
            Message: event.body['validationError']
              ? event.body['validationError']
              : event.body['text']
          }
        });
      }

      if (
        event.body instanceof Blob &&
        event.body.type === 'application/json'
      ) {
        this.blobToText(event.body).subscribe(json => {
          const responseBody = json === 'null' ? {} : JSON.parse(json);
          const modifiedResponse = this.handleResponse(
            event.clone({
              body: responseBody
            })
          );

          interceptObservable.next(
            modifiedResponse.clone({
              body: new Blob([JSON.stringify(modifiedResponse.body)], {
                type: 'application/json'
              })
            })
          );

          interceptObservable.complete();
        });
      } else {
        interceptObservable.next(event);
        interceptObservable.complete();
      }
    }
  }

  protected handleErrorResponse(
    error: any,
    interceptObservable: Subject<HttpEvent<any>>
  ): Observable<any> {
    const errorObservable = new Subject<any>();
    if (!(error.error instanceof Blob)) {
      interceptObservable.error(error);
      interceptObservable.complete();
      return of({});
    }

    this.blobToText(error.error).subscribe(json => {
      const errorBody = json === '' || json === 'null' ? {} : JSON.parse(json);
      const errorResponse = new HttpResponse({
        headers: error.headers,
        body: errorBody
      });

      const ajaxResponse = this.getAbpAjaxResponseOrNull(errorResponse);

      if (ajaxResponse !== null) {
        this.handleAbpResponse(errorResponse, ajaxResponse);
      } else {
        this.handleNonAbpErrorResponse(errorResponse);
      }

      errorObservable.complete();

      // prettify error object.
      error.error = errorBody;
      interceptObservable.error(error);
      interceptObservable.complete();
    });

    return errorObservable;
  }

  blobToText(blob: any): Observable<string> {
    return new Observable<string>((observer: any) => {
      if (!blob) {
        observer.next('');
        observer.complete();
      } else {
        const reader = new FileReader();
        reader.onload = function() {
          observer.next(this.result);
          observer.complete();
        };
        reader.readAsText(blob);
      }
    });
  }

  handleResponse(response: HttpResponse<any>): HttpResponse<any> {
    const ajaxResponse = this.getAbpAjaxResponseOrNull(response);
    if (ajaxResponse === null) {
      return response;
    }

    return this.handleAbpResponse(response, ajaxResponse);
  }

  handleAbpResponse(
    response: HttpResponse<any>,
    ajaxResponse: IAjaxResponse
  ): HttpResponse<any> {
    let newResponse: HttpResponse<any>;

    if (ajaxResponse.success) {
      newResponse = response.clone({
        body: ajaxResponse.result
      });

      if (ajaxResponse.targetUrl) {
        this.handleTargetUrl(ajaxResponse.targetUrl);
      }
    } else {
      newResponse = response.clone({
        body: ajaxResponse.result
      });

      if (!ajaxResponse.error) {
        // ajaxResponse.error = this.defaultError;
      }
      // this.logError(ajaxResponse.error);
      // this.showError(ajaxResponse.error);

      if (response.status === 401) {
        // this.handleUnAuthorizedRequest(null, ajaxResponse.targetUrl);
      }
    }

    return newResponse;
  }

  getAbpAjaxResponseOrNull(response: HttpResponse<any>): IAjaxResponse | null {
    if (!response || !response.headers) {
      return null;
    }

    const contentType = response.headers.get('Content-Type');
    if (!contentType) {
      return null;
    }

    if (contentType.indexOf('application/json') < 0) {
      return null;
    }

    const responseObj = JSON.parse(JSON.stringify(response.body));
    if (!responseObj.__abp) {
      return null;
    }

    return responseObj as IAjaxResponse;
  }

  handleTargetUrl(targetUrl: string): void {
    if (!targetUrl) {
      location.href = '/';
    } else {
      location.href = targetUrl;
    }
  }

  handleNonAbpErrorResponse(response: HttpResponse<any>) {
    const self = this;

    // switch (response.status) {
    // case 401:
    //    self.handleUnAuthorizedRequest(
    //        self.showError(self.defaultError401),
    //        '/'
    //    );
    //    break;
    // case 403:
    //    self.showError(self.defaultError403);
    //    break;
    // case 404:
    //    self.showError(self.defaultError404);
    //    break;
    // default:
    //    self.showError(self.defaultError);
    //    break;
    // }
  }
}
