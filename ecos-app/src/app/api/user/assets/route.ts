import { Business, BusinessSlug, Congregation, CongregationSlug, GenericError, State, StateSlug } from "@/customs/utils/types"
import { dbGetBusinessesByOwner, dbGetCongregationsByOwner, dbGetStatesByOwner } from "@/app/db/query"
import { businessesToSlugs, congregationsToSlugs, statesToSlugs } from "@/customs/utils/tools"
import { NextRequest, NextResponse } from "next/server"
import { FieldPacket, QueryError } from "mysql2"

export async function POST(request: NextRequest) {
    if (request.method !== 'POST') 
        return NextResponse.json({ error: true, message: 'FORBIDDEN' }, { status: 403 })
    
    const data = await request.json()

    if (!data.username)
        return NextResponse.json({ error: true, message: 'BAD REQUEST' }, { status: 401 })

    const states: StateSlug[] = await dbGetStatesByOwner(data.username).then(result => {
        if ((result as GenericError).error !== undefined) {
            console.log((result as GenericError).message)
            return []
        }

        return statesToSlugs((result as [State[], FieldPacket[]])[0])
    })

    const congregations: CongregationSlug[] = await dbGetCongregationsByOwner(data.username).then(result => {
        if ((result as GenericError).error !== undefined) {
            console.log((result as GenericError).message)
            return []
        }

        return congregationsToSlugs((result as [Congregation[], FieldPacket[]])[0])
    })

    const businesses: BusinessSlug[] = await dbGetBusinessesByOwner(data.username).then(result => {
        if ((result as QueryError).code !== undefined) {
            console.log('Failed to get businesses assets from DB in API')
            return []
        }

        return businessesToSlugs((result as [Business[], FieldPacket[]])[0])
    })

    return NextResponse.json({ states: states, congregations: congregations, businesses: businesses }, { status: 200 })
}