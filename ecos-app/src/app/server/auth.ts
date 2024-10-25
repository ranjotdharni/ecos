'use server'

import { API_SESSION_ROUTE, AUTH_CODES } from "../../customs/utils/constants"
import { FieldPacket, QueryError, QueryResult } from "mysql2"
import { GenericError, Session } from "@/customs/utils/types"
import { dbGetSession, dbDropSession } from "../db/query"
import { cookies } from "next/headers"

const PASSWORD_SPECIAL_CHARACTERS: RegExp = /[~`!@#$%^&*()\-_+={}[\]|\\;:"<>,./?]/
const SESSION_VALIDITY_PERIOD: number = 2   // minutes that the session is valid for

// ensure first and last name pass rules, return error string or void
export async function validateName(firstname: string, lastname: string): Promise<string | void> {
    if (firstname.indexOf(' ') >= 0) // first name whitespace
        return 'First Name may not contain whitespaces'

    if (lastname.indexOf(' ') >= 0) // last name whitespace
        return 'Last Name may not contain whitespaces'

    if (firstname.length < 2) // first name length
        return 'First name must be at least 2 characters'

    if (firstname.length > 32)
        return 'First name may be at most 32 characters'

    if (lastname.length < 2) // last name length
        return 'Last name must be at least 2 characters'

    if (lastname.length > 32)
        return 'Last name may be at most 32 characters'
}

// ensure username passes rules, return error string or void
export async function validateUsername(username: string): Promise<string | void> {
    if (username.indexOf(' ') >= 0) // whitespace
        return 'Username may not contain whitespaces'

    if (username.length < 8) // length
        return 'Username must be at least 8 characters'

    if (username.length > 64)
        return 'Username may be at most 64 characters'
}

// ensure password passes rules, return error string or void
export async function validatePassword(password: string): Promise<string | void> {
    if (password.indexOf(' ') >= 0) // whitespace
        return 'Password may not contain whitespaces'

    if (password.length < 8) // length
        return 'Password must be at least 8 characters'

    if (password.length > 64)
        return 'Password may be at most 64 characters'

    if (!PASSWORD_SPECIAL_CHARACTERS.test(password)) // special character
        return 'Password must contain one special character'

    if (!/[a-z]/.test(password)) // lowercase character
        return 'Password must contain one lowercase character'

    if (!/[A-Z]/.test(password)) // uppercase character
        return 'Password must contain one uppercase character'
}

// Uniformly generate expiration for session cookies (in utc)
export async function generateSessionExpirationDate(): Promise<Date> {
    const expiry: Date = new Date() 
    expiry.setMinutes(expiry.getMinutes() + SESSION_VALIDITY_PERIOD)
    return expiry
}

// Check if utc session has expired
export async function isSessionExpired(expiry: Date): Promise<boolean> {
    return new Date() > expiry
}

// grab auth status from db
export async function getAuthentication(username: string): Promise<Session[] | GenericError> {
    // get session
    let result: [QueryResult, FieldPacket[]] | QueryError = await dbGetSession(username)

    if ((result as QueryError).code !== undefined) {    // ISE when getting session, authenticate again
        console.log(result)
        return { error: true, message: 'DATABASE ERROR' }
    }

    const session: Session[] = (result as [Session[], FieldPacket[]])[0]

    return session
}

// confirm user's auth status, requires full session api route, this works in functions where a request comes from a client component
export async function isAuthenticated(route: string): Promise<number | GenericError> {
    // check authentication
    const cookieList = cookies()

    if (!cookieList.has('username') || !cookieList.has('token'))    // session cookies not found
        return AUTH_CODES.NOT_AUTHENTICATED

    const response = await fetch(route, {   // contact api for db status check (because middleware on edge runtime can't query, smh why nextjs WHY?!?!)
        method: 'POST',
        body: JSON.stringify({
            username: cookieList.get('username')!.value,
            token: cookieList.get('token')!.value,
            key: process.env.API_KEY
        })
    })

    const data = await response.json()  // parse response

    if (data.error)
        return data.error as GenericError

    return data.session as number // return status
}

// confirm user's auth status, this works from server components
export async function manualAuthentication(username: string, token: string, key: string): Promise<number | GenericError> { 
    const response = await fetch(`${process.env.ORIGIN}${API_SESSION_ROUTE}`, {   // contact api for db status check (because middleware on edge runtime can't query, smh why nextjs WHY?!?!)
        method: 'POST',
        body: JSON.stringify({
            username: username,
            token: token,
            key: key
        })
    })

    const data = await response.json()  // parse response

    if (data.error)
        return data.error as GenericError

    return data.session as number // return status
}

// generate auth cookies' options uniformly
export async function generateAuthCookieOptions(expiry: Date) {
    return {
        maxAge: (expiry.getTime() - (new Date()).getTime()) / 1000,
        httpOnly: true,
        sameSite: true,
        secure: process.env.ENV === 'prod'
    }
}

// sign user out
export async function signOut(username: string): Promise<string | void> {
    const cookieList = cookies()

    cookieList.delete('username')
    cookieList.delete('token')

    let result: [QueryResult, FieldPacket[]] | QueryError = await dbDropSession(username)

    if ((result as QueryError).code !== undefined) {    // ISE when dropping session
        console.log(result)
        return '500 Internal Server Error'
    }
}