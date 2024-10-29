import { API_USER_DETAILS_ROUTE, AUTH_ROUTE } from "./constants"
import { redirect } from "next/navigation"
import { UserDetails } from "./types"

// grab user details, requires authentication, for use in client only
export async function fetchUser(): Promise<UserDetails> {
    if (process.env.NEXT_PUBLIC_ENV === 'dev')
        return {
            username: 'user1',
            firstname: 'Jane',
            lastname: 'Doe',
            empire: 1,
            gold: 9999.99
        }

    const response = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_USER_DETAILS_ROUTE}`)
    const result = await response.json()  // parse response

    if (result.error)
        redirect(`${process.env.ORIGIN}${AUTH_ROUTE}`)

    return result as UserDetails
}

// convert a date object to database formatted string
export function dateToSQLDate(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ')
}

// calculate worker wage (per second)
export function calculateWage(baseEarningRate: number, rankMultiplier: number, workerCount: number, workerRank: number, laborSplit: number): number {
    return (baseEarningRate * (3 + workerCount)) * (laborSplit + (rankMultiplier * workerRank))
}

// calculate amount of time passed since a given date (in seconds)
export function timeSince(start: Date, compare?: Date): number {
    return Math.floor(((compare ? compare : new Date()).getTime() - start.getTime()) / 1000)
}

// convert a given number of seconds into a timer string (00:00:00 format)
export function timerString(seconds: number): string {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');

    return `${hours}:${minutes}:${s}`;
}