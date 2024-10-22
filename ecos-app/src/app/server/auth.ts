'use server'

import { AUTH_CODES, AUTH_EXEMPT_ROUTES, DEFAULT_SUCCESS_ROUTE, NEW_EMPIRE_ROUTE } from "../../customs/utils/constants"
import { dbCheckCredentials, dbCreateUser, dbGenerateSession, dbGetSession } from "../db/query"
import { Session, User, AuthFormSlug } from "@/customs/utils/types"
import { FieldPacket, QueryError, QueryResult } from "mysql2"
import { dateToSQLDate } from "@/customs/utils/tools"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { compare, hash } from "bcrypt"
import { v4 as uuidv4 } from "uuid"

const PASSWORD_SPECIAL_CHARACTERS: RegExp = /[~`!@#$%^&*()\-_+={}[\]|\\;:"<>,./?]/
const PASSWORD_SALT_ROUNDS: number = 10

// minutes that the session is valid for
const SESSION_VALIDITY_PERIOD: number = 2

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
async function generateSessionExpirationDate(): Promise<Date> {
    const expiry: Date = new Date() 
    expiry.setMinutes(expiry.getMinutes() + SESSION_VALIDITY_PERIOD)
    return expiry
}

// Check if utc session has expired
function isSessionExpired(expiry: Date): boolean {
    return new Date() > expiry
}

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

    if (session.length === 0 || isSessionExpired(session[0].expires_at)) // session not found or expired, authenticate again
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
export async function handleAuthentication(pathname: string): Promise<number> {
    // skip auth in development
    //if (process.env.ENV === 'dev') 
    //    return AUTH_CODES.EXEMPT

    // handle auth exempt routes
    if (AUTH_EXEMPT_ROUTES.includes(pathname))
        return AUTH_CODES.EXEMPT

    // check user's authentication status
    return await isAuthenticated()
}

// generate auth cookies' options uniformly
async function generateAuthCookieOptions(expiry: Date) {
    return {
        maxAge: (expiry.getTime() - (new Date()).getTime()) / 1000,
        httpOnly: true,
        sameSite: true,
        secure: process.env.ENV === 'prod'
    }
}

// Submit credential authentication form handler
export async function userAuthenticate(isNewUser: boolean, details: AuthFormSlug, urlParams: { [key: string]: string | string[] | undefined }): Promise<string | void> {
    if (isNewUser) {    // create new user

        // validate name
        const invalidName: string | void = await validateName(details.firstname!, details.lastname!)

        if (invalidName) 
            return invalidName

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
        const hashPassword: string = await hash(details.password, PASSWORD_SALT_ROUNDS)
        let result: [QueryResult, FieldPacket[]] | QueryError = await dbCreateUser(uuidv4(), details.firstname!, details.lastname!, details.username, hashPassword, dateToSQLDate(new Date()))

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
        
        if (credentials.length === 0 || !await compare(details.password, credentials[0].password))
            return 'Username/Password not found'

    }

    // create session
    const session_expiration: Date = await generateSessionExpirationDate()
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