import { dbGetInvitesFrom, dbGetInvitesTo, dbGetUser, dbInvitesToStateSlugs } from "@/app/db/query"
import { GenericError, Invite, StateInvite, User } from "@/customs/utils/types"
import { invitesToSlugs } from "@/customs/utils/actions"
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
        console.log('Query Error in /api/invite: ', result)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
    }

    const user: User = (result as [User[], FieldPacket[]])[0][0]

    const output: [Invite[], FieldPacket[]] | GenericError = await dbGetInvitesTo(user.username)

    if ((output as GenericError).error !== undefined) {
        console.log('Query Error in /api/invite: ', output)
        return NextResponse.json(output as GenericError, { status: 403 })
    }

    const invites: (StateInvite)[] | GenericError = await invitesToSlugs((output as [Invite[], FieldPacket[]])[0])

    if ((invites as GenericError).error !== undefined) {    // ISE when getting invites info
        console.log('Query Error in /api/invite: ', invites)
        return NextResponse.json(invites as GenericError, { status: 500 })
    }

    return NextResponse.json(invites as (StateInvite)[], { status: 200 })
    //
}

export async function POST(request: NextRequest) {
    if (request.method !== 'POST') 
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })

    const cookieList = await cookies()

    if (!cookieList.has('username')) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    const result: [User[], FieldPacket[]] | QueryError = await dbGetUser(cookieList.get('username')!.value)

    if ((result as QueryError).code !== undefined || (result as [User[], FieldPacket[]])[0].length === 0) {    // ISE when getting user info
        console.log('Query Error in /api/invite: ', result)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
    }

    const user: User = (result as [User[], FieldPacket[]])[0][0]
    
    const data = await request.json()

    if (data.from === undefined || data.type === undefined)
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 }) 

    const output: [Invite[], FieldPacket[]] | GenericError = await dbGetInvitesFrom(user.user_id, Number(data.type))

    if ((output as GenericError).error !== undefined) {
        console.log('Query Error in /api/invite: ', output)
        return NextResponse.json(output as GenericError, { status: 403 })
    }

    const invites: StateInvite[] | GenericError = await dbInvitesToStateSlugs((output as [Invite[], FieldPacket[]])[0], Number(data.type))

    if ((invites as GenericError).error !== undefined) {    // ISE when getting invites info
        console.log('Query Error in /api/invite: ', invites)
        return NextResponse.json(invites as GenericError, { status: 500 })
    }

    return NextResponse.json(invites as StateInvite[], { status: 200 })
    //
}