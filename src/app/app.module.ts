import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService
} from '@ngx-translate/core';

import { AppConsts } from './shared/constants/constants';
import { HttpErrorInterceptor } from './shared/http-interceptor';
import { NgSelectModule } from '@ng-select/ng-select';
// import {NgxMaskModule} from 'ngx-mask';
import { AuthService } from './core/services/app-auth-n.service';
import { ChakavakEventsBus } from './core/services/EventBus/chakavak-event-bus';
import { AppLoadService } from './shared/services/app-load-service';
// import {NgxSpinnerModule} from 'ngx-spinner';
import { NgProgressModule } from 'ngx-progressbar';
import { RTL } from '@progress/kendo-angular-l10n';
// import {AngularFontAwesomeModule} from 'angular-font-awesome';
import { ConfirmDialog } from './shared/dialogs/Confirm/confirm.dialog';
// import { UiSwitchModule } from 'ngx-toggle-switch';
import { ErrorDialog } from './shared/dialogs/Error/error.dialog';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { ToastrModule } from 'ngx-toastr';

import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { IntlModule } from '@progress/kendo-angular-intl';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFa from '@angular/common/locales/fa';
// import { CurrencyMaskModule, CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';


registerLocaleData(localeFa, 'fa-IR');

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function getRemoteServiceBaseUrl(): string {
  return AppConsts.remoteServiceBaseUrl;
}

export let InjectorInstance: Injector;
// export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
//   align: 'right',
//   allowNegative: true,
//   decimal: ',',
//   precision: 2,
//   prefix: 'R$ ',
//   suffix: '',
//   thousands: '.'
// };
@NgModule({
  entryComponents: [ConfirmDialog, ErrorDialog],
  declarations: [AppComponent, ConfirmDialog, ErrorDialog],
  imports: [
    DateInputsModule,
    IntlModule,
    // CurrencyMaskModule,
    // NgxMaskModule.forRoot(),
    // UiSwitchModule,
    NgSelectModule,
    LoadingBarModule,
    // AngularFontAwesomeModule,
    BrowserModule,
    CoreModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatSidenavModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatDialogModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    // NgxSpinnerModule,
    NgProgressModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    NotificationModule
  ],
  // Enable Right-to-Left mode for Kendo UI components
  providers: [
    // { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig } ,
    { provide: RTL, useValue: true },
    { provide: LOCALE_ID, useValue: 'fa-IR' },
    AppLoadService,
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      deps: [AppLoadService],
      multi: true
    },
    // { provide: LocationStrategy, useClass: HashLocationStrategy },
    ChakavakEventsBus,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private translate: TranslateService) {
    translate.setDefaultLang('fa');
    translate.use('fa');
  }
}

export function init_app(appLoadService: AppLoadService) {
  return () => appLoadService.initializeApp();
}
