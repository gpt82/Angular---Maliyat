import { Component } from "@angular/core";
import { AuthService } from "../../core/services/app-auth-n.service";

@Component({
  selector: "silent-refresh",
  templateUrl: "./silent-refresh.html"
})
export class SilentRefreshTokenComponent {
  constructor(private authService: AuthService) {
    this.authService.completeSielntRefresh();
  }
}
