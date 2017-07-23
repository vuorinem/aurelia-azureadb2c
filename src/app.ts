import { autoinject } from "aurelia-framework";
import { AuthService, UserService } from "./auth/index";
// Note: TS would allow simplifying import to "./auth", but current bundler doesn't supprot it

@autoinject
export class App {
  constructor(
    private authService: AuthService,
    private userService: UserService) {
  }

  private async login() {
    await this.authService.login();
  }
}
