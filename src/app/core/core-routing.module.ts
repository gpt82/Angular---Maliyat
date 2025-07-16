import { NgModule } from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
// import { LoginComponent } from './login/login.component';
import { AuthCallbackComponent } from '../form/oauth/oauth-callback.component';
import { SilentRefreshTokenComponent } from '../form/silent-refresh/silent-refresh.component';
import { LogoutComponent } from '../form/logout/logout.component';
// import {RopaModule} from "../ropa/ropa.module";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'form',
    pathMatch: 'full'
  },
  {
    path: 'auth-callback',
    component: AuthCallbackComponent
  },
  {
    path: 'renew-token-callback',
    component: SilentRefreshTokenComponent
  },
  // {
  //   path: 'login',
  //   component: LoginComponent
  // },

  // {
  //   path: 'ropa',
  //   loadChildren: '../ropa/ropa.module#RopaModule',//() => DriverModule
  // },
  {
    path: 'form',
    //loadChildren:
    loadChildren:  () => import('../form/form.module').then(m => m.FormModule),//() => FormModule//
    // children: [
    //   { path: '', component: FormModule }
    // ]
  },
  {
    path: 'logout',
    component: LogoutComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{ preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class CoreRoutingModule { }
