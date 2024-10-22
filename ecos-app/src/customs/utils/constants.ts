export const DEFAULT_SUCCESS_ROUTE: string = '/'
export const AUTH_ROUTE: string = '/welcome'
export const NEW_EMPIRE_ROUTE: string = '/pickempire'
export const AUTH_EXEMPT_ROUTES: string[] = []

export const AUTH_CODES = {
    EXEMPT: -1,              // Auth exempt route
    NOT_AUTHENTICATED: 0,    // Needs to login
    NULL_EMPIRE: 1,          // logged in but needs to select empire
    LOGGED_IN: 2             // logged in and empire selected
}