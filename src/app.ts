import { autoinject } from "aurelia-framework";
import { HttpClient } from "aurelia-fetch-client";
import { AuthService } from "./auth/auth-service";
// Note: TS would allow simplifying import to "./auth", but current bundler doesn't supprot it

@autoinject
export class App {
  private apiResponses: Response[] = [];

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService) {

    this.httpClient.configure(config => 
      config.withInterceptor(this.authService.getAuthenticationInterceptor()));
  }

  private async login() {
    await this.authService.login();
  }

  private async logout() {
    await this.authService.logout();
  }

  private async callApi() {
    this.apiResponses.push(await this.httpClient.fetch('/endpoint'));
  }
}
