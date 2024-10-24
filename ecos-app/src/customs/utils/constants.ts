

export const DEFAULT_SUCCESS_ROUTE: string = '/game/home'
export const AUTH_ROUTE: string = '/welcome'
export const NEW_EMPIRE_ROUTE: string = '/pickempire'
export const AUTH_EXEMPT_ROUTES: string[] = [
    '/',
    '/api/session' // session check route
]

export const PASSWORD_SALT_ROUNDS: number = 10

export const AUTH_CODES = {
    EXEMPT: -1,              // Auth exempt
    NOT_AUTHENTICATED: 0,    // Needs to login
    NULL_EMPIRE: 1,          // logged in but needs to select empire
    LOGGED_IN: 2             // logged in and empire selected
}

export const COIN_ICON: string = 'https://img.icons8.com/color/96/average.png'