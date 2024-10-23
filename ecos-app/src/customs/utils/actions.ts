'use server'

import { generateAuthCookieOptions, generateSessionExpirationDate, validateName, validatePassword, validateUsername } from "@/app/server/auth"
import { AUTH_ROUTE, DEFAULT_SUCCESS_ROUTE, NEW_EMPIRE_ROUTE, PASSWORD_SALT_ROUNDS } from "../../customs/utils/constants"
import { dbGetUser, dbCreateUser, dbGenerateSession, dbSetEmpire } from "../../app/db/query"
import { FieldPacket, QueryError, QueryResult } from "mysql2"
import { User, AuthFormSlug } from "@/customs/utils/types"
import { dateToSQLDate } from "@/customs/utils/tools"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { hash, compare } from "bcrypt"
import { v4 as uuidv4 } from "uuid"

// NOTE
// I used one of these functions in a client component so NextJS would not
// shut up about using a server component in a client component with a specific 
// import. So, I was basically forced to move this to this newly created file which
// I'm now using for server actions in client components.

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
        const result: [QueryResult, FieldPacket[]] | QueryError = await dbGetUser(details.username)

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

// select empire
export async function selectEmpire(empire: number, urlParams: { [key: string]: string | string[] | undefined }): Promise<string | void> {
    const cookieList = cookies()

    if (!cookieList.has('username'))
        redirect(AUTH_ROUTE)

    const username: string = cookieList.get('username')!.value

    let result: [QueryResult, FieldPacket[]] | QueryError = await dbGetUser(username)

    if ((result as QueryError).code !== undefined) {    // ISE when getting user info
        console.log(result)
        return '500 Internal Server Error'
    }

    const user: User[] = (result as [User[], FieldPacket[]])[0]

    if (user.length === 0)
        return 'User Not Found'

    if (user[0].empire !== null)
        return 'Empire Already Selected'

    result = await dbSetEmpire(username, empire)

    if ((result as QueryError).code !== undefined) {
        console.log(result)
        return '500 Internal Server Error'
    }

    // determine if redirect route param was passed
    let nextRoute: string

    if (urlParams.next === undefined)
        nextRoute = DEFAULT_SUCCESS_ROUTE
    else if (Array.isArray(urlParams.next))
        nextRoute = urlParams.next[0]
    else 
        nextRoute = urlParams.next

    // redirect
    redirect(nextRoute)
}