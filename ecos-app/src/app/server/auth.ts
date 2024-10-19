

const AUTH_ROUTE: string = '/welcome'
const SUCCESS_ROUTE: string = '/'
const AUTH_EXEMPT_ROUTES: string[] = [
    AUTH_ROUTE
]

const PASSWORD_SPECIAL_CHARACTERS: RegExp = /[~`!@#$%^&*()\-_+={}[\]|\\;:"<>,./?]/

// confirm and handle user's auth status
export async function isAuthenticated() {
    // check if route is is exempt

    // check authentication

    // redirect to auth route or success route

    console.log('confirming user is logged in...')
}

// ensure username passes rules, return error string or void
export function validateUsername(username: string): string | void {
    if (username.length < 8) // length
        return 'Username must be at least 8 characters'
}

// ensure password passes rules, return error string or void
export function validatePassword(password: string): string | void {
    if (password.length < 8) // length
        return 'Password must be at least 8 characters'

    if (!PASSWORD_SPECIAL_CHARACTERS.test(password)) // special character
        return 'Password must contain one special character'

    if (!/[a-z]/.test(password)) // lowercase character
        return 'Password must contain one lowercase character'

    if (!/[A-Z]/.test(password)) // uppercase character
        return 'Password must contain one uppercase character'
}