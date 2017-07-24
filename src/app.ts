import { autoinject } from "aurelia-framework";
import { AuthService } from "./auth/auth-service";
// Note: TS would allow simplifying import to "./auth", but current bundler doesn't supprot it

@autoinject
export class App {
  constructor(private authService: AuthService) {
  }

  private async login() {
    await this.authService.login();
  }

  private async logout() {
    await this.authService.logout();
  }
}
