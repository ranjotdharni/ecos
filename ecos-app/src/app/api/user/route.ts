import { GenericError, User, UserDetails } from "@/customs/utils/types"
import { manualAuthentication } from "@/app/server/auth"
import { NextRequest, NextResponse } from "next/server"
import { AUTH_CODES } from "@/customs/utils/constants"
import { FieldPacket, QueryError } from "mysql2"
import { dbGetUser } from "@/app/db/query"

export async function POST(request: NextRequest) {
    if (request.method !== 'POST') 
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })
    
    const data = await request.json()

    if (!data.username || !data.token || !data.key)
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

    const authStatus: number | GenericError = await manualAuthentication(data.username, data.token, data.key)

    if (authStatus !== AUTH_CODES.LOGGED_IN)
        return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

    const result: [User[], FieldPacket[]] | QueryError = await dbGetUser(data.username)

    if ((result as QueryError).code !== undefined || (result as [User[], FieldPacket[]])[0].length === 0) {    // ISE when getting user info
        console.log('Query Error in /api/user: ', result)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
    }

    const user: User[] = (result as [User[], FieldPacket[]])[0]

    const userDetails: UserDetails = {
        username: user[0].username,
        firstname: user[0].first_name,
        lastname: user[0].last_name,
        empire: user[0].empire!,
        gold: user[0].gold
    }

    return NextResponse.json(userDetails, { status: 200 })
}