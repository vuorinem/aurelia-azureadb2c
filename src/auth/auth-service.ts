import * as hello from "hellojs";
import authConfig from "./auth-config";

export class AuthService {
    private isAuthenticated: boolean = false;
    private name: string;

    constructor() {
        // Configure Azure AD B2C module for hello.js
        hello.init({
            azureAD: {
                oauth: {
                    version: 2,
                    auth: this.getAuthUrl(authConfig.adTenantName, authConfig.adPolicyName),
                },
                scope_delim: ' ',
            }
        });

        // Configure application details
        hello.init({ azureAD: authConfig.adClientId }, {
            redirect_uri: authConfig.adRedirectUri,
            scope: authConfig.scopes,
            response_type: 'token',
            display: 'page',
        });

        this.handleAuthenticationResponse();
    }

    public async login() {
        hello('azureAD').login()

        return hello.login('azureAD', {}, () => {
            this.handleAuthenticationResponse()
        });
    }

    private handleAuthenticationResponse() {
        const response = hello('azureAD').getAuthResponse();

        if (!response) {
            this.isAuthenticated = false;
            return;
        }

        if (!('access_token' in response) || !response.access_token) {
            this.isAuthenticated = false;
            return;
        }

        this.isAuthenticated = true;
    }

    private getAuthUrl(tenant: string, policy: string) {
        return `https://login.microsoftonline.com/tfp/${tenant}/${policy}/oauth2/v2.0/authorize`;
    }
}
