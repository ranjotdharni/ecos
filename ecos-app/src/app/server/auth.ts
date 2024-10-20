'use server'

import { dbCheckCredentials, dbCreateUser, dbGenerateSession, dbGetSession, User, Session } from "../db/query"
import { FieldPacket, QueryError, QueryResult } from "mysql2"
import { AuthFormSlug } from "../components/auth/AuthForm"
import { dateToSQLDate } from "@/customs/utils/tools"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import {v4 as uuidv4} from "uuid"
import bcrypt from "bcrypt"

const DEFAULT_SUCCESS_ROUTE: string = '/'
const AUTH_ROUTE: string = '/welcome'
const NEW_EMPIRE_ROUTE = '/pickempire'
const AUTH_EXEMPT_ROUTES: string[] = []

const AUTH_CODES = {
    NOT_AUTHENTICATED: 0,    // Needs to login
    NULL_EMPIRE: 1,          // logged in but needs to select empire
    LOGGED_IN: 2             // logged in and empire selected
}

const PASSWORD_SPECIAL_CHARACTERS: RegExp = /[~`!@#$%^&*()\-_+={}[\]|\\;:"<>,./?]/
const PASSWORD_SALT_ROUNDS: number = 10

// confirm user's auth status
export async function isAuthenticated(): Promise<number> {

    // check authentication
    const cookieList = cookies()

    if (!cookieList.has('username') || !cookieList.has('token'))    // session cookies not found
        return AUTH_CODES.NOT_AUTHENTICATED

    // get session
    let result: [QueryResult, FieldPacket[]] | QueryError = await dbGetSession(cookieList.get('username')!.value, cookieList.get('token')!.value)

    if ((result as QueryError).code !== undefined) {    // ISE when getting session, authenticate again
        console.log(result)
        return AUTH_CODES.NOT_AUTHENTICATED
    }

    const session: Session[] = (result as [Session[], FieldPacket[]])[0]
    
    if (session.length === 0 || new Date() > session[0].expires_at) // session not found or expired, authenticate again
        return AUTH_CODES.NOT_AUTHENTICATED

    // At this point user has valid session, now check if empire selected

    result = await dbCheckCredentials(cookieList.get('username')!.value)    // grab user info

    if ((result as QueryError).code !== undefined) {    // ISE when getting user info, authenticate again
        console.log(result)
        return AUTH_CODES.NOT_AUTHENTICATED
    }

    const credentials: User[] = (result as [User[], FieldPacket[]])[0]
    
    if (credentials.length === 0)   // user info not found, authenticate again
        return AUTH_CODES.NOT_AUTHENTICATED

    if (credentials[0].empire === null) // user authenticated but empire not selected
        return AUTH_CODES.NULL_EMPIRE

    return AUTH_CODES.LOGGED_IN // user authenticated and empire is selected
}

// handle user's auth status
export async function handleAuthentication() {
    // skip auth in development
    if (process.env.ENV === 'dev')
        return

    // check if route is exempt
    const headerList = headers()
    const pathname = headerList.get("current-path")
    
    // handle auth exempt routes
    if (AUTH_EXEMPT_ROUTES.includes(pathname as string))
        return

    // check user's authentication status
    const status: number = await isAuthenticated()

    if (status === AUTH_CODES.NOT_AUTHENTICATED && pathname !== AUTH_ROUTE) {   // not authenticated and not on auth route already
        redirect(`${AUTH_ROUTE}${(pathname !== DEFAULT_SUCCESS_ROUTE ? `?next=${pathname}` : ``)}`)
    }
    else if (status === AUTH_CODES.NULL_EMPIRE && pathname !== NEW_EMPIRE_ROUTE) {  // empire not selected and not on empire selection route
        redirect(`${NEW_EMPIRE_ROUTE}${(pathname !== DEFAULT_SUCCESS_ROUTE ? `?next=${pathname}` : ``)}`)
    }
    else if (status === AUTH_CODES.LOGGED_IN && (pathname === NEW_EMPIRE_ROUTE || pathname === AUTH_ROUTE)) {   // logged in but on an auth or empire select route
        redirect(DEFAULT_SUCCESS_ROUTE)
    }
}

// ensure username passes rules, return error string or void
export async function validateUsername(username: string): Promise<string | void> {
    if (username.length < 8) // length
        return 'Username must be at least 8 characters'

    if (username.length > 64)
        return 'Username may be at most 64 characters'
}

// ensure password passes rules, return error string or void
export async function validatePassword(password: string): Promise<string | void> {
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

// Uniformly generate max age for session cookies
async function generateCookieExpirationDate(): Promise<Date> {
    const expiry: Date = new Date() 
    expiry.setMinutes(expiry.getMinutes() + 2)
    return expiry
}

// generate auth cookies' options uniformly
async function generateAuthCookieOptions(expiry: Date) {
    return {
        maxAge: (expiry.getTime() - (new Date()).getTime()) / 1000,
        httpOnly: true,
        sameSite: true,
        secure: process.env.ENV !== 'dev'
    }
}

// Submit credential authentication form handler
export async function userAuthenticate(isNewUser: boolean, details: AuthFormSlug, urlParams: { [key: string]: string | string[] | undefined }) {
    if (isNewUser) {    // create new user

        // validate username
        if (details.username === details.password)
            return 'Username may not match password'

        const invalidUsername: string | void = await validateUsername(details.username)

        if (invalidUsername)
            return invalidUsername

        // validate password
        if (details.password !== details.confirm) {
            return 'Passwords must match'
        }

        const invalidPassword: string | void = await validatePassword(details.password)

        if (invalidPassword)
            return invalidPassword

        // add user
        const hash: string = await bcrypt.hash(details.password, PASSWORD_SALT_ROUNDS)
        let result: [QueryResult, FieldPacket[]] | QueryError = await dbCreateUser(uuidv4(), details.username, hash, dateToSQLDate(new Date()))

        if ((result as QueryError).code !== undefined) 
            return 'User already exists'
    
    }
    else {  // log in existing user
        const result: [QueryResult, FieldPacket[]] | QueryError = await dbCheckCredentials(details.username)

        if ((result as QueryError).code !== undefined) {
            console.log(result)
            return '500 Internal Server Error'
        }

        const credentials: User[] = (result as [User[], FieldPacket[]])[0]
        
        if (credentials.length === 0 || !await bcrypt.compare(details.password, credentials[0].password))
            return 'Username/Password not found'

    }

    // create session
    const session_expiration: Date = await generateCookieExpirationDate()
    const session_token: string = uuidv4() 

    const result: [QueryResult, FieldPacket[]] | QueryError = await dbGenerateSession(details.username, session_token, dateToSQLDate(session_expiration))    // automatically destroys any existing session(s)

    if ((result as QueryError).code !== undefined) {
        console.log(result)
        return '500 Internal Server Error'
    }

    // set session cookies
    const cookieList = cookies()
    const cookieOptions = await generateAuthCookieOptions(session_expiration)
    cookieList.set('username', details.username, cookieOptions)
    cookieList.set('token', session_token, cookieOptions)

    // determine if redirect route param was passed
    let nextRoute: string

    if (urlParams.next === undefined)
        nextRoute = (isNewUser ? NEW_EMPIRE_ROUTE : DEFAULT_SUCCESS_ROUTE)
    else if (Array.isArray(urlParams.next))
        nextRoute = (isNewUser ? `${NEW_EMPIRE_ROUTE}?next=${urlParams.next[0]}` : urlParams.next[0])
    else 
        nextRoute = (isNewUser ? `${NEW_EMPIRE_ROUTE}?next=${urlParams.next}` : urlParams.next)

    // redirect
    redirect(nextRoute)
}