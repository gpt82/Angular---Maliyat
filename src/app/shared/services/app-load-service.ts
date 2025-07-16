import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConsts } from '../constants/constants';

@Injectable()
export class AppLoadService {
  constructor(private httpClient: HttpClient) {}
  initializeApp(): Promise<any> {
    return new Promise((resolve, reject) => {
      AppConsts.Initialize(this.httpClient)
        .then(a => {
          resolve();
        })
        .catch(error => {
          console.log(
            'Initializng Apps Config using AppConsts.Initialize() faield.'
          );
          console.log(error);
          reject();
        });

      this.httpClient.get('./assets/app-setting.json').subscribe(data => {
        console.log('iniitializing app cosnts!');
        AppConsts.appBaseUrl = data['appBaseUrl'];
        AppConsts.remoteServiceBaseUrl = data['remoteServiceBaseUrl'];
        AppConsts.oidc_issuer = data['issuer'];
        console.log('app cosnts iniitialized!');
        resolve();
      });
    });
  }
}
