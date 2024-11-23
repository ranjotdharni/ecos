
export const DEFAULT_SUCCESS_ROUTE: string = '/game/home'
export const NEW_EMPIRE_ROUTE: string = '/pickempire'
export const AUTH_ROUTE: string = '/welcome'

export const CONGREGATION_NEW_PAGE_ROUTE: string = '/game/congregation/new'    // new congregation page
export const CONGREGATION_PAGE_ROUTE: string = '/game/congregation'    // congregation page
export const BUSINESS_PAGE_ROUTE: string = '/game/business'    // business page
export const JOB_NEW_PAGE_ROUTE: string = '/game/job/new'   // new job page
export const NOT_FOUND_PAGE_ROUTE: string = '/not-found' // not found page
export const EMPIRE_PAGE_ROUTE: string = '/game/empire'    // empire page
export const STATE_PAGE_ROUTE: string = '/game/state'   // state page
export const JOB_PAGE_ROUTE: string = '/game/job'    // job page

export const API_COLLECTION_CONGREGATION_ROUTE: string = '/api/collection/congregation' // get collections by congregation
export const API_BUSINESS_CONGREGATION_ROUTE: string = '/api/business/congregation' // get businesses by congregation
export const API_CONGREGATION_EARNINGS_ROUTE: string = '/api/congregation/earnings' // get earnings of congregations
export const API_COLLECTION_BUSINESS_ROUTE: string = '/api/collection/business' // get collections by business
export const API_CONGREGATION_STATE_ROUTE: string = '/api/congregation/state' // get congregations by state
export const API_CONGREGATION_OWNER_ROUTE: string = '/api/congregation/owner' // congregation data by owner
export const API_BUSINESS_EARNINGS_ROUTE: string = '/api/business/earnings' // get earnings of businesses
export const API_BUSINESS_EMPIRE_ROUTE: string = '/api/business/empire' // get businesses by user empire
export const API_CONGREGATION_ROUTE: string = '/api/congregation' // get congregation data
export const API_STATE_OWNER_ROUTE: string = '/api/state/owner' // get states by owner
export const API_BUSINESS_ROUTE: string = '/api/business' // get businesses by empire
export const API_USER_DETAILS_ROUTE: string = '/api/user' // get user details
export const API_SESSION_ROUTE: string = '/api/session' // check session
export const API_WORKER_ROUTE: string = '/api/worker' // get user's job
export const API_STATE_ROUTE: string = '/api/state' // get states

export const MIN_CLOCK_REFRESH_TIME: number = 14400 // minimum wait seconds before you may clock in again after clocking out
export const PASSWORD_SALT_ROUNDS: number = 10
export const TOKEN_SALT_ROUNDS: number = 10
export const MAX_CLOCK_TIME: number = 28800 // maximum payable clocked in seconds, any TIME > MAX_CLOCK_TIME = overtime (not payed)

export const AUTH_EXEMPT_ROUTES: string[] = [
    API_BUSINESS_ROUTE,
    API_SESSION_ROUTE,
    '/'
]

export const AUTH_CODES = {
    NOT_AUTHENTICATED: 0,   // Needs to login
    NULL_EMPIRE: 1,     // logged in but needs to select empire
    LOGGED_IN: 2,   // logged in and empire selected
    EXEMPT: -1,     // Auth exempt
}

export const CONSTRUCTION_ICON: string = 'https://img.icons8.com/color/96/full-tool-storage-box-.png'
export const CONGREGATION_OWNER_ICON: string = 'https://img.icons8.com/color/48/inauguration.png'
export const FOOD_SERVICE_ICON: string = 'https://img.icons8.com/color/96/vegetarian-food.png'
export const BUSINESS_OWNER_ICON: string = 'https://img.icons8.com/color/96/keys-holder.png'
export const STATE_ICON: string = 'https://img.icons8.com/color/96/israeli-parliament.png'
export const JOB_ICON: string = 'https://img.icons8.com/color/96/parse-from-clipboard.png'
export const LABOR_SPLIT_ICON: string = 'https://img.icons8.com/color/96/coin-in-hand.png'
export const SETTLEMENT_ICON: string = 'https://img.icons8.com/color/96/structural.png'
export const CONGREGATION_ICON: string = 'https://img.icons8.com/color/96/castle.png'
export const RELIGIOUS_ICON: string = 'https://img.icons8.com/color/96/cathedral.png'
export const BUSINESS_ICON: string = 'https://img.icons8.com/color/96/money-bag.png'
export const HOMEPAGE_ICON: string = 'https://img.icons8.com/color/96/booking.png'
export const MILITARY_ICON: string = 'https://img.icons8.com/color/96/cannon.png'
export const RESIDENTIAL_ICON: string = 'https://img.icons8.com/color/96/bed.png'
export const CROWN_ICON: string = 'https://img.icons8.com/color/96/fairytale.png'
export const MEDICINE_ICON: string = 'https://img.icons8.com/color/96/pills.png'
export const CITY_ICON: string = 'https://img.icons8.com/color/96/city-hall.png'
export const COIN_ICON: string = 'https://img.icons8.com/color/96/average.png'
export const GAME_ICON: string = 'https://img.icons8.com/color/96/coins.png'