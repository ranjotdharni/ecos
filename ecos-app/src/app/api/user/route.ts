import { User, UserDetails } from "@/customs/utils/types"
import { NextRequest, NextResponse } from "next/server"
import { FieldPacket, QueryError } from "mysql2"
import { dbGetUser } from "@/app/db/query"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    if (request.method !== 'GET') 
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })
    
    const cookieList = await cookies()

    if (!cookieList.has('username')) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    const result: [User[], FieldPacket[]] | QueryError = await dbGetUser(cookieList.get('username')!.value)

    if ((result as QueryError).code !== undefined || (result as [User[], FieldPacket[]])[0].length === 0) {    // ISE when getting user info
        console.log('Query Error in /api/user: ', result)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
    }

    const user: User[] = (result as [User[], FieldPacket[]])[0]

    const userDetails: UserDetails = {
        user_id: user[0].user_id,
        username: user[0].username,
        firstname: user[0].first_name,
        lastname: user[0].last_name,
        empire: user[0].empire!,
        gold: user[0].gold
    }

    return NextResponse.json(userDetails, { status: 200 })
}