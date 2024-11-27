import { Business, BusinessSlug, Collection, CollectionSlug, Congregation, CongregationSlug, State, StateInvite, StateInviteMutable, StateSlug, UserDetails, Worker, WorkerSlug } from "./types"
import { API_USER_DETAILS_ROUTE, AUTH_ROUTE } from "./constants"
import { redirect } from "next/navigation"

/**
 * @typedef {import('./types').UserDetails} @see {@link UserDetails}
 * @async<br>
 * 
 * Grabs non-sensitive user data using session authentication.
 * Returns a Promise to UserDetails object.
 *
 * @example
 * ```typescript
 * await fetchUser(); // returns UserDetails object
 * ```
 *
 * @returns {Promise<UserDetails>} A promise that resolves to object containing non-sensitive user data.
 */
export async function fetchUser(): Promise<UserDetails> {
    if (process.env.NEXT_PUBLIC_ENV === 'dev')
        return {
            user_id: '0000000',
            username: 'user1',
            firstname: 'Jane',
            lastname: 'Doe',
            empire: 1,
            gold: 0.00
        }

    const response = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_USER_DETAILS_ROUTE}`)
    const result = await response.json()  // parse response

    if (result.error !== undefined)
        redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}`)

    return result as UserDetails
}

/**
 * Convert TypeScript Date object to a MySQL DATETIME string.
 *
 * @example
 * ```typescript
 * dateToSQLDate(new Date());
 * ```
 *
 * @param date - The Date object to convert
 * @returns String in 'YYYY-MM-DD hh:mm:ss' format.
 */
export function dateToSQLDate(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * Calculate the wage (gold per second) of a single worker.
 *
 * @example
 * ```typescript
 * calculateWage(250.00, 0.001, 1, 1, 0.005); // returns 6.00
 * ```
 *
 * @param baseEarningRate - The base income (gold per second) of the worker's business
 * @param rankMultiplier - The employee rank increase amount as a decimal (percentage of total revenue)
 * @param workerCount - The number of workers at the worker's business (inclusive)
 * @param workerRank - The worker's rank
 * @param laborSplit - The business' congregation's labor split as a decimal (percentage of total revenue for a single worker)
 * @returns The amount of gold the worker earns per second as a number.
 */
export function calculateWage(baseEarningRate: number, rankMultiplier: number, workerCount: number, workerRank: number, laborSplit: number): number {
    return (baseEarningRate * (3 + workerCount)) * (laborSplit + (rankMultiplier * workerRank))
}

/**
 * Calculate the number of seconds that have passed since a given date to now (floored to the nearest whole number).
 *
 * @example
 * ```typescript
 * timeSince(new Date()); // returns 0
 * ```
 *
 * @param start - The subject Date object.
 * @param compare - The Date object to compare time since against, leave undefined for time since start to now.
 * @returns Floored whole number of seconds from start to now (or from start to compare if not undefined).
 */
export function timeSince(start: Date, compare?: Date): number {
    return Math.floor(((compare ? compare : new Date()).getTime() - start.getTime()) / 1000)
}

/**
 * Convert a given number of seconds to a timer-formatted string.
 *
 * @example
 * ```typescript
 * timerString(3600); // returns '01:00:00'
 * ```
 *
 * @param seconds - Number of seconds to convert to timer string.
 * @returns String in 'hh:mm:ss' format.
 */
export function timerString(seconds: number): string {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');

    return `${hours}:${minutes}:${s}`;
}

export function dateToFormat(arg1: string, arg2: Date): string
{
    let str = arg1.toLowerCase().slice()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    let mm = (str.includes('mmm') ? 'mmm' : 'mm')
    let dd = (str.includes('ddd') ? 'ddd' : 'dd')
    let yy = (str.includes('yyyy') ? 'yyyy' : 'yy')

    str = str.replace(mm, (mm === 'mm' ? (arg2.getMonth() + 1).toString().padStart(2, '0') : monthNames[arg2.getMonth()]))
    str = str.replace(dd, (dd === 'dd' ? (arg2.getDate()).toString().padStart(2, '0') : dayNames[arg2.getDay()]))
    str = str.replace(yy, (yy === 'yyyy' ? (arg2.getFullYear()).toString() : arg2.getFullYear().toString().slice(-2)))

    return str
}

export function getRandomDecimalInclusive(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function collectionsToSlugs(rawCollections: Collection[]): CollectionSlug[] {
    return rawCollections.map(raw => {
        return {
            collection_id: raw.collection_id,
            str: Number(raw.str),
            ctr: Number(raw.ctr),
            total_split: Number(raw.total_split),
            revenue: Number(raw.revenue),
            collected_at: new Date(raw.collected_at),
            business: {
                business_id: raw.business_id,
                congregation: {
                    congregation_id: raw.congregation_id,
                    state: {
                        state_id: raw.state_id,
                        empire: raw.empire,
                        state_name: raw.state_name,
                        state_tax_rate: raw.state_tax_rate,
                        state_owner_firstname: raw.state_owner_first_name,
                        state_owner_lastname: raw.state_owner_last_name
                    },
                    empire: raw.empire,
                    congregation_name: raw.congregation_name,
                    congregation_status: raw.congregation_status,
                    congregation_tax_rate: raw.congregation_tax_rate,
                    labor_split: raw.labor_split,
                    congregation_owner_firstname: raw.congregation_owner_first_name,
                    congregation_owner_lastname: raw.congregation_owner_last_name
                },
                business_name: raw.business_name,
                business_type: raw.business_type,
                base_earning_rate: raw.base_earning_rate,
                rank_earning_increase: raw.rank_earning_increase,
                worker_count: raw.worker_count,
                hiring: raw.hiring !== 0,
                business_owner_firstname: raw.business_owner_first_name,
                business_owner_lastname: raw.business_owner_last_name
            }
        }
    })
}

export function businessesToSlugs(rawBusinesses: Business[]): BusinessSlug[] {
    return rawBusinesses.map(raw => {
        return {
            business_id: raw.business_id,
            congregation: {
                congregation_id: raw.congregation_id,
                state: {
                    state_id: raw.state_id,
                    empire: raw.empire,
                    state_name: raw.state_name,
                    state_tax_rate: raw.state_tax_rate,
                    state_owner_firstname: raw.state_owner_first_name,
                    state_owner_lastname: raw.state_owner_last_name
                },
                empire: raw.empire,
                congregation_name: raw.congregation_name,
                congregation_status: raw.congregation_status,
                congregation_tax_rate: raw.congregation_tax_rate,
                labor_split: raw.labor_split,
                congregation_owner_firstname: raw.congregation_owner_first_name,
                congregation_owner_lastname: raw.congregation_owner_last_name
            },
            business_name: raw.business_name,
            business_type: raw.business_type,
            base_earning_rate: raw.base_earning_rate,
            rank_earning_increase: raw.rank_earning_increase,
            worker_count: raw.worker_count,
            hiring: raw.hiring !== 0,
            business_owner_firstname: raw.business_owner_first_name,
            business_owner_lastname: raw.business_owner_last_name
        }
    })
}

export function workersToSlugs(rawWorkers: Worker[]): WorkerSlug[] {
    return rawWorkers.map(raw => {    
        return {
            worker_id: raw.worker_id,
            firstname: raw.worker_first_name,
            lastname: raw.worker_last_name,
            worker_rank: raw.worker_rank,
            clocked_in: raw.clocked_in,
            clocked_out: raw.clocked_out,
            business: {
                business_id: raw.business_id,
                congregation: {
                    congregation_id: raw.congregation_id,
                    state: {
                        state_id: raw.state_id,
                        empire: raw.empire,
                        state_name: raw.state_name,
                        state_tax_rate: raw.state_tax_rate,
                        state_owner_firstname: raw.state_owner_first_name,
                        state_owner_lastname: raw.state_owner_last_name
                    },
                    empire: raw.empire,
                    congregation_name: raw.congregation_name,
                    congregation_status: raw.congregation_status,
                    congregation_tax_rate: raw.congregation_tax_rate,
                    labor_split: raw.labor_split,
                    congregation_owner_firstname: raw.congregation_owner_first_name,
                    congregation_owner_lastname: raw.congregation_owner_last_name
                },
                business_name: raw.business_name,
                business_type: raw.business_type,
                base_earning_rate: raw.base_earning_rate,
                rank_earning_increase: raw.rank_earning_increase,
                worker_count: raw.worker_count,
                hiring: raw.hiring !== 0,
                business_owner_firstname: raw.business_owner_first_name,
                business_owner_lastname: raw.business_owner_last_name
            }
        }
    })
}

export function congregationsToSlugs(rawCongregations: Congregation[]): CongregationSlug[] {
    return rawCongregations.map(raw => {
        return {
            congregation_id: raw.congregation_id,
            empire: raw.empire,
            state: {
                state_id: raw.state_id,
                state_name: raw.state_name,
                state_owner_firstname: raw.state_owner_first_name,
                state_owner_lastname: raw.state_owner_last_name,
                state_tax_rate: raw.state_tax_rate,
                empire: raw.empire
            },
            congregation_owner_firstname: raw.congregation_owner_first_name,
            congregation_owner_lastname: raw.congregation_owner_last_name,
            congregation_name: raw.congregation_name,
            labor_split: Number(raw.labor_split),
            congregation_status: Number(raw.congregation_status),
            congregation_tax_rate: Number(raw.congregation_tax_rate)
        }
    })
}

export function statesToSlugs(rawStates: State[]): StateSlug[] {
    return rawStates.map(raw => {
        return {
            state_id: raw.state_id,
            state_name: raw.state_name,
            state_owner_firstname: raw.state_owner_first_name,
            state_owner_lastname: raw.state_owner_last_name,
            state_tax_rate: raw.state_tax_rate,
            empire: raw.empire
        }
    })
}

export function stateInviteMutablesToSlugs(rawInviteMutables: StateInviteMutable[]): StateInvite[] {
    return rawInviteMutables.map(raw => {
        return {
            user_from: {
                id: raw.user_from_user_id,
                username: raw.user_from_username,
                first: raw.user_from_first_name,
                last: raw.user_from_last_name
            },
            user_to: {
                id: raw.user_to_user_id,
                username: raw.user_to_username,
                first: raw.user_to_first_name,
                last: raw.user_to_last_name
            },
            from: raw.invite_from ? {
                state_id: raw.state_id!,
                state_name: raw.state_name!,
                state_owner_firstname: raw.state_owner_first_name!,
                state_owner_lastname: raw.state_owner_last_name!,
                state_tax_rate: Number(raw.state_tax_rate!),
                empire: Number(raw.empire)
            } : undefined,
            to: {
                congregation_id: raw.congregation_id,
                empire: Number(raw.empire),
                state: {
                    state_id: raw.congregation_state_id,
                    state_name: raw.congregation_state_name,
                    state_owner_firstname: raw.congregation_state_owner_first_name,
                    state_owner_lastname: raw.congregation_state_owner_last_name,
                    state_tax_rate: Number(raw.congregation_state_tax_rate),
                    empire: Number(raw.congregation_state_empire)
                },
                congregation_owner_firstname: raw.congregation_owner_first_name,
                congregation_owner_lastname: raw.congregation_owner_last_name,
                congregation_name: raw.congregation_name,
                labor_split: Number(raw.labor_split),
                congregation_status: Number(raw.congregation_status),
                congregation_tax_rate: Number(raw.congregation_tax_rate)
            },
            type: Number(raw.invite_type),
            accepted: Number(raw.accepted),
            at: new Date(raw.invited_at)
        }
    })
}

export function calculateTotalSplit(workers: WorkerSlug[], startFrom: number = 0): number {
    if (startFrom >= workers.length)
        return 0

    const worker: WorkerSlug = workers[startFrom]

    return (worker.business.congregation.labor_split * (1 + worker.worker_rank)) + calculateTotalSplit(workers, startFrom + 1)
}

export function calculateBaseEarningRate(business: BusinessSlug, workers: WorkerSlug[]) {
    return business.base_earning_rate * (3 + workers.length)
}

export function calculateEarningRate(business: BusinessSlug, workers: WorkerSlug[]) {
    return (1 - business.congregation.state.state_tax_rate - business.congregation.congregation_tax_rate - calculateTotalSplit(workers)) * calculateBaseEarningRate(business, workers)
}