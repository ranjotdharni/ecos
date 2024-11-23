import { Congregation, CongregationSlug, GenericError } from "@/customs/utils/types"
import { congregationsToSlugs } from "@/customs/utils/tools"
import { dbGetCongregationsByState } from "@/app/db/query"
import { NextRequest, NextResponse } from "next/server"
import { FieldPacket } from "mysql2"

export async function POST(request: NextRequest) {
    if (request.method !== 'POST') 
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })
    
    const data = await request.json()

    if (data.stateId === undefined)
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 }) 

    const result: [Congregation[], FieldPacket[]] | GenericError = await dbGetCongregationsByState(data.stateId)

    if ((result as GenericError).error !== undefined) {    // ISE when getting congregation info
        console.log('Query Error in /api/congregation/state: ', result)
        return NextResponse.json({ error: (result as GenericError).message }, { status: 500 })
    }

    const rawCongregations: Congregation[] = (result! as [Congregation[], FieldPacket[]])[0]
    const congregations: CongregationSlug[] = congregationsToSlugs(rawCongregations)

    return NextResponse.json(congregations, { status: 200 })
}