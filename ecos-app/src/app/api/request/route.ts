import { GenericError, Request, RequestSlug, User } from "@/customs/utils/types"
import { dbGetRequests, dbGetUser } from "@/app/db/query"
import { requestsToSlugs } from "@/customs/utils/tools"
import { NextRequest, NextResponse } from "next/server"
import { FieldPacket, QueryError } from "mysql2"
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
        console.log('Query Error in /api/request: ', result)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
    }

    const user: User = (result as [User[], FieldPacket[]])[0][0]

    const requestsResult: [Request[], FieldPacket[]] | GenericError = await dbGetRequests(user.user_id)

    if ((requestsResult as GenericError).error !== undefined)
        return NextResponse.json(requestsResult as GenericError, { status: 500 })

    const requests: RequestSlug[] = requestsToSlugs((requestsResult as [Request[], FieldPacket[]])[0])

    return NextResponse.json(requests, { status: 200 })
}