import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/app-auth-n.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChakavakEventsBus } from '../../core/services/EventBus/chakavak-event-bus';
import { EventConstants, RolesConstants, AppConsts } from '../../shared/constants/constants';

@Component({
    selector: 'logout',
    templateUrl: './logout.html'
})
export class LogoutComponent implements OnInit {

    constructor(private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
        private eventBus: ChakavakEventsBus) {
    }

    ngOnInit() {
        this.authService.finishAuthentication();
    }
}