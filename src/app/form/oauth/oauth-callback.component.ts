import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChakavakEventsBus } from '../../core/services/EventBus/chakavak-event-bus';
import { EventConstants, RolesConstants, AppConsts } from '../../shared/constants/constants';

@Component({
    selector: 'oauth-callback',
    templateUrl: './oauth-callback.html'
})
export class AuthCallbackComponent implements OnInit {

    constructor(private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
        private eventBus: ChakavakEventsBus) {
    }

    ngOnInit() {
        this.authService.completeAuthentication(this.redirectUser.bind(this));
        this.redirectUser(this.authService);
    }
    redirectUser(oauthService: AuthService): void {
        if (oauthService.hasRoles([RolesConstants.Administrators, RolesConstants.SuperAdministrators])) {
            this.router.navigate(['form/']);
        }
        else if (oauthService.hasRole(RolesConstants.Drivers)) {
            this.router.navigate(['driver/']);
        }
        else {
            this.router.navigate(['']);
        }
    }
}
