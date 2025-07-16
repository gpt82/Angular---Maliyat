import { Injectable, OnInit } from '@angular/core'

import { UserManager, UserManagerSettings, User } from 'oidc-client'
import {
  AppConsts,
  TokenNameConstants,
  RolesConstants,
} from '../../shared/constants/constants'

import { MatSnackBar } from '@angular/material/snack-bar'
import * as jwt_decode from 'jwt-decode'
import { HttpClient } from '@angular/common/http'
import { LoadingBarService } from '@ngx-loading-bar/core'
import { map, shareReplay } from 'rxjs/operators'
import { LookupBranchResultDto } from '../../form/branch/dtos/LookupBranchResultDto'
import { Observable } from 'rxjs'

@Injectable()
export class AuthService implements OnInit {
  private url = '/v1/api/Person'
  private manager: UserManager
  private user: User
  branchId: number
  selectedBranchId: number = null
  selectedBranchNmae: string = ""
  isSuperAdmin: boolean
  isSuperUser: boolean
  isAccUser: boolean
  isAccAdmin: boolean
  isAdmin: boolean
  isReadOnlyUser: boolean
  isBodyTransAgenda: boolean
  isAutoParts: boolean
  isMobileDevice: boolean
  isLogged = false
  UserBranchName = ''
  constructor(
    public snackBar: MatSnackBar,
    // private spinner: NgxSpinnerService,
    // public ngProgress: NgProgress,
    private loadingBar: LoadingBarService,
    private http: HttpClient,
  ) {
    this.isAccUser = this.hasRole(RolesConstants.AccountingUser)
    this.isReadOnlyUser = this.hasRole(RolesConstants.ReadOnlyUser)
    this.isBodyTransAgenda = this.hasRole(RolesConstants.BodyTransmission)
    this.isSuperAdmin = this.hasRole(RolesConstants.SuperAdministrators)
    this.isSuperUser = this.hasRole(RolesConstants.SuperUsers)
    this.isAdmin = this.hasRole(RolesConstants.Administrators)
    this.isAccAdmin = this.hasRole(RolesConstants.AccAdminUser)
    this.isAutoParts = this.hasRole(RolesConstants.AutoParts)
  }

  isMobile(): boolean {
    this.isMobileDevice = +window.innerWidth < 992
    return +window.innerWidth < 992
  }
  static getAccessToken(): string {
    const item = localStorage.getItem(TokenNameConstants.accessTokenKey)
    return item
  }
  ngOnInit() {
    // this.isSuperAdmin = this.hasRoles([
    //   RolesConstants.Administrators,
    //   RolesConstants.SuperAdministrators
    // ]);
    this.isMobile()
  }
  initialize(): void {
    if (this.manager == null) {
      this.manager = new UserManager(getClientSettings())
    }
  }
  isLoggedIn(): boolean {
    const user = this.getUser()
    this.isLogged = user != null
    return user != null
  }
  getUser(): User {
    const user = localStorage.getItem(TokenNameConstants.tokenKey)
    if (user) {
      this.isLogged = true
      // console.log('getUser()' + this.isLogged);
      return JSON.parse(user) as User
    }
    return this.user ? this.user : null
  }
  getProfile(): any {
    const user = this.getUser()
    return user ? user.profile : null
  }
  getRoles(): string[] {
    const profile = this.getProfile()
    if (profile) {
      return profile.role
    }
    return null
  }
  hasRole(roleName: string): boolean {
    const roles = this.getRoles()
    if (roles) {
      return roles.indexOf(roleName) > -1
    } else {
      return false
    }
  }
  hasRoles(roleName: string[]): boolean {
    let userIsInRole = false
    roleName.some((role, index, _arr) => {
      userIsInRole = this.hasRole(role)
      if (userIsInRole) {
        return true
      }
    })
    return userIsInRole
  }
  getFullName(): string {
    return this.getProfile().FullName
  }
  startAuthentication(): Promise<void> {
    this.initialize()
    return this.manager.signinRedirect().then(() => {
      this.isLogged = true
    })
  }
  completeAuthentication(callBack: (AuthService) => void): Promise<void> {
    this.initialize()
    return new Promise<void>((resolve, reject) =>
      this.manager.signinRedirectCallback().then((user) => {
        this.setToken(user)
        this.isLogged = true
        console.log('completeAuthentication()' + this.isLogged)
        if (callBack) {
          callBack(this)
        }
        return resolve
      }),
    )
  }
  getUserBranches(): Observable<LookupBranchResultDto[]> {
    return this.http.get<any>(`${this.url}/BranchId`).pipe(
      map((item) => item as LookupBranchResultDto[]),
      shareReplay(1),
    )
  }
  getUserBranch() {
    return this.http.get<any>(`${this.url}/activeBranch`)
  }
  getUserBranchName() {
    return this.getUserBranch().subscribe(
      (res) => (this.UserBranchName = res['name']),
    )
    // this.UserBranchName;
  }
  renewToken(): void {
    this.initialize()
    // this.spinner.show();
    // this.ngProgress.start();
    this.loadingBar.start()
    this.snackBar.open('در حال تازه سازی توکن', 'پیغام', {
      duration: 3000,
      panelClass: ['snack-bar-info'],
    })
    this.manager
      .signinSilent({
        scope: AppConsts.oidc_issuer.scope,
        response_type: AppConsts.oidc_issuer.response_type,
      })
      .catch((error) => {
        // debugger;
        // this.spinner.hide();
        // this.ngProgress.done();
        this.loadingBar.complete()
        console.error(error)
        this.finishAuthentication()
      })
  }

  completeSielntRefresh(): void {
    this.initialize()
    this.manager
      .signinSilentCallback()
      .then((a) => {
        this.snackBar.open('توکن با موفقیت تازه سازی شد.', '', {
          duration: 3000,
          panelClass: ['snack-bar-sucsess'],
        })
        // this.spinner.hide();
        // this.ngProgress.done();
        this.loadingBar.complete()
      })
      .catch((error) => {
        // this.spinner.hide();
        // this.ngProgress.done();
        this.loadingBar.complete()
        console.error(error)
      })
  }
  finishAuthentication(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.initialize()
      this.manager.signoutRedirect().then((result) => {
        this.cleareToken()
        resolve()
      })
    })
  }
  getAuthorizationHeaderValue(): string {
    const user = this.getUser()
    if (user) {
      return `${user.token_type} ${user.access_token}`
    }
    return null
  }

  setToken(user: User) {
    if (user) {
      this.user = user
      localStorage.setItem(TokenNameConstants.tokenKey, JSON.stringify(user))
      localStorage.setItem(
        TokenNameConstants.accessTokenKey,
        this.getAuthorizationHeaderValue(),
      )
    }
  }
  private cleareToken(): void {
    localStorage.removeItem(TokenNameConstants.tokenKey)
  }

  getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token)

    if (decoded.exp === undefined) {
      return null
    }

    const date = new Date(0)
    date.setUTCSeconds(decoded.exp)
    return date
  }

  isTokenExpired(token?: string): boolean {
    if (!token) {
      return true
    }

    const date = this.getTokenExpirationDate(token)
    if (date === undefined) {
      return false
    }
    return !(date.valueOf() > new Date().valueOf())
  }
}

export function getClientSettings(): UserManagerSettings {
  return AppConsts.oidc_issuer
    ? {
      authority: AppConsts.oidc_issuer.authority,
      client_id: AppConsts.oidc_issuer.client_id,
      redirect_uri: AppConsts.oidc_issuer.redirect_uri,
      post_logout_redirect_uri:
        AppConsts.oidc_issuer.post_logout_redirect_uri,
      response_type: AppConsts.oidc_issuer.response_type,
      scope: AppConsts.oidc_issuer.scope,
      // filterProtocolClaims: AppConsts.oidc_issuer.filterProtocolClaims,
      // loadUserInfo: AppConsts.oidc_issuer.loadUserInfo,
      automaticSilentRenew:
        AppConsts.oidc_issuer.automaticSilentRenew === 'true',
      // monitorSession: AppConsts.oidc_issuer.monitorSession,
      // signingKeys: AppConsts.oidc_issuer.signingKeys,
      silent_redirect_uri: AppConsts.oidc_issuer.silent_redirect_uri,
      // metadata: AppConsts.oidc_issuer.metadata
    }
    : {}
}
