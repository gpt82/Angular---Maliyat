import { HttpClient } from '@angular/common/http';

export class EventConstants {
  public static readonly AuthenticationComplited = 'AuthenticationComplited';
}
export class TokenNameConstants {
  public static readonly tokenKey = 'a5smm_utoken';
  public static readonly accessTokenKey = 'a5smm_access_token';
}
export class RolesConstants {
  public static readonly Administrators = 'Administrators';
  public static readonly SuperAdministrators = 'SuperAdministrators';
  public static readonly Drivers = 'Drivers';
  public static readonly SuperUsers = 'SuperUsers';
  public static readonly Users = 'Users';
  public static readonly BodyTransmission = 'BodyTransmission';
  public static readonly AccAdminUser = 'AccAdmin';
  public static readonly AccountingUser = 'Accounting';
  public static readonly ReadOnlyUser = 'ReadOnlyUser';
  public static readonly AutoParts = 'AutoParts';
  static isBodyTransAgenda(isBodyTransAgenda: any): boolean {
    throw new Error('Method not implemented.');
  }
}
export class AppConsts {
  private static initialized = false;
  static remoteServiceBaseUrl: 'http://localhost:6002'; // in remote
  static appBaseUrl: 'http://localhost:4001';
  static oidc_issuer: oidc_issuer;
  static Initialize(httpClient: HttpClient): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        console.log('Start reading Apps config from assest file!');

        httpClient.get('./assets/app-setting.json').subscribe(data => {
          console.log('Apps Config data from assest successfully fetched!');
          console.log('Start initializing Apps config data!');
          this.appBaseUrl = data['appBaseUrl'];
          this.remoteServiceBaseUrl = data['remoteServiceBaseUrl'];
          this.oidc_issuer = data['issuer'];
          this.initialized = true;

          console.log('End initializng Apps config!');

          return resolve();
        });
      } else {
        return reject();
      }
    });
  }
}

// tslint:disable-next-line: class-name
export class oidc_issuer {
  authority_configurator: string;
  authority: string;
  client_id: string;
  redirect_uri: string;
  post_logout_redirect_uri: string;
  response_type: string;
  scope: string;
  filterProtocolClaims: string;
  loadUserInfo: string;
  automaticSilentRenew: string;
  monitorSession: string;
  signingKeys: Array<signingKey>[];
  silent_redirect_uri: string;
  metadata: oics_metadata;
}
// tslint:disable-next-line: class-name
export class oics_metadata {
  issuer: string;
  jwks_uri: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint: string;
  check_session_iframe: string;
  revocation_endpoint: string;
  introspection_endpoint: string;
}
// tslint:disable-next-line: class-name
export class signingKey {
  kty: string;
  use: string;
  kid: string;
  e: string;
  n: string;
  alg: string;
}
