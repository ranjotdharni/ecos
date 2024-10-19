import { FieldPacket, QueryError, QueryResult } from "mysql2"
import { dbCreateUser, dbGenerateSession } from "../db/query"
import { AuthFormSlug } from "../components/auth/AuthForm"
import { dateToSQLDate } from "@/customs/utils/tools"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import {v4 as uuidv4} from "uuid"
import bcrypt from "bcrypt"

export const DEFAULT_SUCCESS_ROUTE: string = '/'
const AUTH_ROUTE: string = '/welcome'
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

    if (username.length > 64)
        return 'Username may be at most 64 characters'
}

// ensure password passes rules, return error string or void
export function validatePassword(password: string): string | void {
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

export async function userAuthenticate(isNewUser: boolean, details: AuthFormSlug) {
    if (isNewUser) {    // create new user

        // validate username
        if (details.username === details.password)
            return 'Username may not match password'

        const invalidUsername: string | void = validateUsername(details.username)

        if (invalidUsername)
            return invalidUsername

        // validate password
        if (details.password !== details.confirm) {
            return 'Passwords must match'
        }

        const invalidPassword: string | void = validatePassword(details.password)

        if (invalidPassword)
            return invalidPassword

        // add user
        const hash: string = await bcrypt.hash(details.password, 10)
        let result: [QueryResult, FieldPacket[]] | QueryError = await dbCreateUser(uuidv4(), details.username, hash, dateToSQLDate(new Date()))

        if ((result as QueryError).code !== undefined) 
            return 'User already exists'
        
        // create session
        const session_expiration: Date = new Date()
        const session_token: string = uuidv4() 

        session_expiration.setMinutes(session_expiration.getMinutes() + 2)

        result = await dbGenerateSession(details.username, session_token, dateToSQLDate(session_expiration))    // automatically destroys any existing session(s)

        if ((result as QueryError).code !== undefined) {
            console.log(result)
            return '500 Internal Server Error'
        }

        // set session cookies
        const cookieList = cookies()
        const cookieOptions = {
            maxAge: (session_expiration.getTime() - (new Date()).getTime()) / 1000,
            httpOnly: true,
            sameSite: true,
            secure: process.env.ENV !== 'dev'
        }

        cookieList.set('username', details.username, cookieOptions)
        cookieList.set('token', session_token, cookieOptions)

        // redirect
        redirect(DEFAULT_SUCCESS_ROUTE)
    }
    else {  // log in existing user

        console.log(details)
    }
}