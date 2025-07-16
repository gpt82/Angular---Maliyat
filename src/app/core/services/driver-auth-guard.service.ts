import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";


import { AuthService } from "./app-auth-n.service";
import {Observable} from "rxjs";

@Injectable()
export class DriverAuthGuardService implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    if (this.authService.isLoggedIn()) {
      var profile = this.authService.getProfile();
      //if role is administrator or super administrator
      return true;
    }

    this.authService.startAuthentication();
    return false;
  }
}
