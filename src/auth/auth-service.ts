import { computedFrom, PLATFORM } from "aurelia-framework";
import { Interceptor } from "aurelia-fetch-client";
import * as hello from "hellojs";
import authConfig from "./auth-config";

export class AuthService {
    private isAuthenticatedInternal: boolean = false;
    private name: string;

    @computedFrom('isAuthenticatedInternal')
    public get isAuthenticated() {
        return this.isAuthenticatedInternal;
    }

    constructor() {
        // Configure Azure AD B2C module for hello.js
        hello.init({
            azureAD: {
                oauth: {
                    version: 2,
                    auth: this.getAuthUrl(authConfig.adTenantName, authConfig.adPolicyName),
                    grant: this.getGrantUrl(authConfig.adTenantName, authConfig.adPolicyName),
                },
                scope_delim: ' ',
                logout: () => {
                    // Azure AD B2C doesn't support logging out in iframe,
                    // so use redirect instead.
                    PLATFORM.location.assign(
                        this.getLogoutUrl(authConfig.adTenantName, authConfig.adPolicyName,
                            authConfig.adRedirectUri)
                    );

                    return true; // Tell hello.js to handle the rest
                },
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

    public getAuthenticationInterceptor(): Interceptor {
        return {
            request(request: Request) {
                const authResponse = hello('azureAD').getAuthResponse();

                if (authResponse && authResponse.access_token) {
                    request.headers.append('Authorization',
                        `Bearer ${authResponse.access_token}`);
                }

                return request;
            },
        };
    }

    public async login() {
        await hello.login('azureAD');

        this.handleAuthenticationResponse();
    }

    public async logout() {
        await hello.logout('azureAD', { force: true });

        this.handleAuthenticationResponse();
    }

    private handleAuthenticationResponse() {
        const response = hello('azureAD').getAuthResponse();

        if (!response) {
            this.isAuthenticatedInternal = false;
            return;
        }

        if (!('access_token' in response) || !response.access_token) {
            this.isAuthenticatedInternal = false;
            return;
        }

        this.isAuthenticatedInternal = true;
    }

    private getAuthUrl(tenant: string, policy: string) {
        return this.getOauthUrl(tenant, policy) + '/authorize';
    }

    private getGrantUrl(tenant: string, policy: string) {
        return this.getOauthUrl(tenant, policy) + '/token';
    }

    private getLogoutUrl(tenant: string, policy: string, redirectUri: string) {
        return this.getOauthUrl(tenant, policy) + '/logout'
            + '?post_logout_redirect_uri=' + encodeURI(redirectUri);
    }

    private getOauthUrl(tenant: string, policy: string) {
        return `https://login.microsoftonline.com/te/${tenant}/${policy}/oauth2/v2.0`;
    }
}
