import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import { Observable } from 'rxjs';
import { AuthService } from './app-auth-n.service';
import { RolesConstants } from '../../shared/constants/constants';

@Injectable()
export class FormAuthGuardService implements CanActivate {
  constructor(private authService: AuthService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    const isAdmin = this.authService.hasRoles([
      RolesConstants.Administrators,
      RolesConstants.SuperAdministrators
    ]);
    if (isAdmin) {
      return true;
    }
    return false;
  }
}
