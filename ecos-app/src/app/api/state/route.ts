import { dbGetStatesByEmpire, dbGetUser } from "@/app/db/query"
import { statesToSlugs } from "@/customs/utils/tools"
import { GenericError, State, StateSlug, User } from "@/customs/utils/types"
import { FieldPacket, QueryError } from "mysql2"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    if (request.method !== 'GET')
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })

    const cookieList = await cookies()

    if (!cookieList.has('username'))
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })

    const result: [User[], FieldPacket[]] | QueryError = await dbGetUser(cookieList.get('username')!.value)

    if ((result as QueryError).code !== undefined || (result as [User[], FieldPacket[]])[0].length === 0) {    // ISE when getting user info
        console.log('Query Error in /api/state: ', result)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR (Failed to Find User)' }, { status: 500 })
    }

    const user: User = (result as [User[], FieldPacket[]])[0][0]

    const statesResult: [State[], FieldPacket[]] | GenericError = await dbGetStatesByEmpire(user.empire!)

    if ((statesResult as GenericError).error !== undefined)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR (Failed to Find States)' }, { status: 500 })

    const rawStates: State[] = (statesResult as [State[], FieldPacket[]])[0]
    const states: StateSlug[] = statesToSlugs(rawStates)

    return NextResponse.json(states, { status: 200 })
}