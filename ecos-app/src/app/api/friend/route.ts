import { Friend, FriendSlug, GenericError, User } from "@/customs/utils/types"
import { dbGetFriends, dbGetUser } from "@/app/db/query"
import { NextRequest, NextResponse } from "next/server"
import { friendsToSlugs } from "@/customs/utils/tools"
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
        console.log('Query Error in /api/friend: ', result)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
    }

    const user: User = (result as [User[], FieldPacket[]])[0][0]

    const friendsResult: [Friend[], FieldPacket[]] | GenericError = await dbGetFriends(user.user_id)

    if ((friendsResult as GenericError).error !== undefined)
        return NextResponse.json(friendsResult as GenericError, { status: 500 })

    const friends: FriendSlug[] = friendsToSlugs((friendsResult as [Friend[], FieldPacket[]])[0])

    return NextResponse.json(friends, { status: 200 })
}