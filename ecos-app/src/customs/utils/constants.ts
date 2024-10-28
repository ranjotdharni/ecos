
export const DEFAULT_SUCCESS_ROUTE: string = '/game/home'
export const NEW_EMPIRE_ROUTE: string = '/pickempire'
export const AUTH_ROUTE: string = '/welcome'

export const CONGREGATION_PAGE_ROUTE: string = '/game/congregation'    // congregation page
export const BUSINESS_PAGE_ROUTE: string = '/game/business'    // business page
export const JOB_NEW_PAGE_ROUTE: string = '/game/job/new'   // new job page
export const EMPIRE_PAGE_ROUTE: string = '/game/empire'    // empire page
export const STATE_PAGE_ROUTE: string = '/game/state'   // state page
export const JOB_PAGE_ROUTE: string = '/game/job'    // job page

export const API_BUSINESS_ROUTE: string = '/api/business' // get businesses by empire
export const API_USER_DETAILS_ROUTE: string = '/api/user' // get user details
export const API_SESSION_ROUTE: string = '/api/session' // check session
export const API_WORKER_ROUTE: string = '/api/job' // get user's job

export const PASSWORD_SALT_ROUNDS: number = 10
export const TOKEN_SALT_ROUNDS: number = 10

export const AUTH_EXEMPT_ROUTES: string[] = [
    API_BUSINESS_ROUTE,
    API_SESSION_ROUTE,
    API_WORKER_ROUTE,
    '/'
]

export const AUTH_CODES = {
    NOT_AUTHENTICATED: 0,   // Needs to login
    NULL_EMPIRE: 1,     // logged in but needs to select empire
    LOGGED_IN: 2,   // logged in and empire selected
    EXEMPT: -1,     // Auth exempt
}

export const CONSTRUCTION_ICON: string = 'https://img.icons8.com/color/96/full-tool-storage-box-.png'
export const FOOD_SERVICE_ICON: string = 'https://img.icons8.com/color/96/vegetarian-food.png'
export const STATE_ICON: string = 'https://img.icons8.com/color/96/israeli-parliament.png'
export const JOB_ICON: string = 'https://img.icons8.com/color/96/parse-from-clipboard.png'
export const CONGREGATION_ICON: string = 'https://img.icons8.com/color/96/castle.png'
export const RELIGIOUS_ICON: string = 'https://img.icons8.com/color/96/cathedral.png'
export const BUSINESS_ICON: string = 'https://img.icons8.com/color/96/money-bag.png'
export const HOMEPAGE_ICON: string = 'https://img.icons8.com/color/96/booking.png'
export const MILITARY_ICON: string = 'https://img.icons8.com/color/96/cannon.png'
export const RESIDENTIAL_ICON: string = 'https://img.icons8.com/color/96/bed.png'
export const CROWN_ICON: string = 'https://img.icons8.com/color/96/fairytale.png'
export const MEDICINE_ICON: string = 'https://img.icons8.com/color/96/pills.png'
export const COIN_ICON: string = 'https://img.icons8.com/color/96/average.png'
export const GAME_ICON: string = 'https://img.icons8.com/color/96/coins.png'