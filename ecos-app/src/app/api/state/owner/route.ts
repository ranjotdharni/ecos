import { GenericError, State, StateSlug } from "@/customs/utils/types"
import { NextRequest, NextResponse } from "next/server"
import { statesToSlugs } from "@/customs/utils/tools"
import { dbGetStatesByOwner } from "@/app/db/query"
import { cookies } from "next/headers"
import { FieldPacket } from "mysql2"

export async function GET(request: NextRequest) {
    if (request.method !== 'GET')
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })

    const cookieList = await cookies()

    if (!cookieList.has('username'))
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })

    const statesResult: [State[], FieldPacket[]] | GenericError = await dbGetStatesByOwner(cookieList.get('username')!.value)

    if ((statesResult as GenericError).error !== undefined)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR (Failed to Find States)' }, { status: 500 })

    const rawStates: State[] = (statesResult as [State[], FieldPacket[]])[0]
    const states: StateSlug[] = statesToSlugs(rawStates)

    return NextResponse.json(states, { status: 200 })
}