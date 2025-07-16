import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';
import { AppConsts, RolesConstants } from './shared/constants/constants';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './core/services/app-auth-n.service';
import { ChakavakEventsBus } from './core/services/EventBus/chakavak-event-bus';
import { EventConstants } from './shared/constants/constants';
import { Router } from '@angular/router';
import { NgSelectConfig } from '@ng-select/ng-select';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ILookupResultDto } from '../app/shared/dtos/LookupResultDto';
import { Observable } from 'rxjs';
import { LookupBranchResultDto } from './form/branch/dtos/LookupBranchResultDto';
import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ChakavakEventsBus]
})
export class AppComponent implements OnInit, AfterViewInit {

  constructor(
    translate: TranslateService,
    public authService: AuthService,
    private http: HttpClient,
    private eventBus: ChakavakEventsBus,
    private router: Router,
    private config: NgSelectConfig,
    private loadingBar: LoadingBarService,

  ) {
    this.isLogin = this.authService.isLogged;
    console.log('constructor' + this.isLogin);
    this.initialize();
    translate.setDefaultLang('fa');
    translate.use('fa');
    this.config.notFoundText = 'موردی نیافتم';
    this.config.typeToSearchText = 'متنی را برای جستجو وارد کنید';
    this.config.loadingText = 'در حال جستجو. کمی صبر کنید ...';
  }
  @ViewChild('sidenav')
  sidenav: MatSidenav;
  isLogin: boolean;
  FullName: string;
  isDriver: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAccAdmin: boolean;
  isBodyTransAgenda: boolean;
  isAccUser: boolean;
  title = 'app';
  selectedBranchId: number = null;

  public branchs$: Observable<LookupBranchResultDto[]>;

  toggleSideNav(): void {
    this.sidenav.toggle();
  }
  ngOnInit(): void {
    this.getBranchs();

    this.eventBus.subscribe(EventConstants.AuthenticationComplited, from => {
      // this.initialize();

    });
  }
  ngAfterViewInit(): void {

    if (+window.innerWidth < 992) {
      this.toggleSideNav();
    }

    // this.initialize();
  }
  getBranchs(): void {
    this.branchs$ = this.authService.getUserBranches();//.subscribe((result: ILookupResultDto[]) => {this.branchs = result;
    this.branchs$.subscribe(result => {
      this.authService.selectedBranchId = result[0]['id'];
      this.authService.selectedBranchNmae = result[0]['title'];
    })
  }
  redirectUser(oauthService: AuthService): void {
    // this.initialize();
    if (this.isAdmin) {
      this.router.navigate(['form/']);
    } else if (this.isDriver) {
      this.router.navigate(['driver/']);
    } else {
      this.router.navigate(['']);
    }
  }
  onChange($event) {
    this.authService.selectedBranchNmae = $event["title"];
// console.log($event)
// console.log(this.authService.selectedBranchNmae )
}
  initialize(): void {
    this.isLogin = this.authService.isLogged;
    console.log('initialize()' + this.isLogin);
    if (this.isLogin) {
      this.FullName = this.authService.getFullName();
      this.isDriver = this.authService.hasRole(RolesConstants.Drivers);
      this.isBodyTransAgenda = this.authService.hasRole(RolesConstants.BodyTransmission);
      this.isAdmin = this.authService.hasRoles([
        RolesConstants.Administrators,
        RolesConstants.SuperAdministrators
      ]);
      this.isSuperAdmin = this.authService.hasRole(RolesConstants.SuperAdministrators);
      this.isAccAdmin = this.authService.hasRole(RolesConstants.AccAdminUser);
      this.isAccUser = this.authService.hasRole(RolesConstants.AccountingUser);
    } else {
      // this.authService.startAuthentication();
    }
  }
  onLogin() {
    this.authService.startAuthentication().then(r => {
      this.isLogin = true;
      console.log('onLogin() ' + this.isLogin);
    }).catch(err => {
      console.log('on login error', err);
    });
  }
  onLogout(): void {
    this.authService.finishAuthentication().then(() => {
      console.log('loged out');
      this.isLogin = false;
    });
  }
  goToProfile(): void {
    window.open(
      AppConsts.oidc_issuer.authority_configurator + 'Manage/Index',
      '_blank'
    );
  }
}
