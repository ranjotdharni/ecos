'use server'

import { DEFAULT_SUCCESS_ROUTE, validatePassword, validateUsername } from "../server/auth"
import AuthForm, { AuthFormSlug } from "../components/auth/AuthForm"
import { dbCreateUser, dbGenerateSession } from "../db/query"
import { FieldPacket, QueryError, QueryResult } from "mysql2"
import { dateToSQLDate } from "@/customs/utils/tools"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import {v4 as uuidv4} from "uuid"
import bcrypt from "bcrypt"

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

        result = await dbGenerateSession(details.username, session_token, dateToSQLDate(session_expiration))

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

export default async function Welcome() {

    return (
        <AuthForm />
    )
}