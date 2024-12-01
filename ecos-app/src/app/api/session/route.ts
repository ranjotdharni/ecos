import { getAuthentication, isSessionExpired } from "@/app/server/auth"
import { GenericError, Session, User } from "@/customs/utils/types"
import { NextRequest, NextResponse } from "next/server"
import { AUTH_CODES } from "@/customs/utils/constants"
import { FieldPacket, QueryError } from "mysql2"
import { dbGetUser } from "@/app/db/query"
import { compare } from "bcrypt"

// Error always gives forbidden because only server should access this route, 
// it thereby inherently does so correctly
export async function POST(request: NextRequest) {
    if (request.method !== 'POST') 
        return NextResponse.json({ error: true, message: 'FORBIDDEN' }, { status: 403 })
    
    const data = await request.json()

    if (!data.username || !data.token || !data.key || data.key !== process.env.API_KEY)
        return NextResponse.json({ error: true, message: 'FORBIDDEN' }, { status: 403 }) 

    const response: Session[] | GenericError = await getAuthentication(data.username)

    if ((response as GenericError).error)
        return NextResponse.json({ error: true, message: 'UNAUTHORIZED' }, { status: 401 })

    const session: Session[] = response as Session[]

    if (session.length === 0 || await isSessionExpired(session[0].expires_at)) // session not found or expired, authenticate again
        return NextResponse.json({ session: AUTH_CODES.NOT_AUTHENTICATED }, { status: 200 })

    if (!(await compare(`${data.token}${process.env.TOKEN_SECRET}`, session[0].auth_token)))
        return NextResponse.json({ session: AUTH_CODES.NOT_AUTHENTICATED }, { status: 200 })

    // At this point user has valid session, now check if empire selected

    const result = await dbGetUser(data.username)   // grab user info

    if ((result as QueryError).code !== undefined) {    // ISE when getting user info, authenticate again
        return NextResponse.json({ session: AUTH_CODES.NOT_AUTHENTICATED }, { status: 200 })
    }

    const credentials: User[] = (result as [User[], FieldPacket[]])[0]

    if (credentials.length === 0)   // user info not found, authenticate
        return NextResponse.json({ session: AUTH_CODES.NOT_AUTHENTICATED }, { status: 200 })

    if (credentials[0].empire === null) // user authenticated but empire not selected
        return NextResponse.json({ session: AUTH_CODES.NULL_EMPIRE }, { status: 200 })

    return NextResponse.json({ session: AUTH_CODES.LOGGED_IN }, { status: 200 }) // user authenticated and empire is selected
}