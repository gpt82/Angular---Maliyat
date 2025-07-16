import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';
// import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { FormAuthGuardService } from './services/form-auth-guard.service';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AuthCallbackComponent } from '../form/oauth/oauth-callback.component';
import { LogoutComponent } from '../form/logout/logout.component';
import { SilentRefreshTokenComponent } from '../form/silent-refresh/silent-refresh.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    CoreRoutingModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [SilentRefreshTokenComponent, AuthCallbackComponent, LogoutComponent,  NotFoundComponent],
  exports: [
    RouterModule
  ],
  providers: [
    AuthenticationService,
    FormAuthGuardService, {
      provide: LOCALE_ID, useValue: 'fa'
    }
  ]
})
export class CoreModule {
  constructor(private translate: TranslateService) {
    translate.setDefaultLang('fa');
    translate.use('fa');
  }
}
