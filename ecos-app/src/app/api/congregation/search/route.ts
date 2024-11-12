import { Congregation, CongregationSlug } from "@/customs/utils/types"
import { dbSearchCongregationsByNames } from "@/app/db/query"
import { NextRequest, NextResponse } from "next/server"
import { FieldPacket, QueryError } from "mysql2"

export async function POST(request: NextRequest) {
    if (request.method !== 'POST')
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })

    const data = await request.json()

    if (!data.state && !data.congregation) {
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })
    }

    const result: [Congregation[], FieldPacket[]] | QueryError = await dbSearchCongregationsByNames(data.congregation, data.state)

    if ((result! as QueryError).code !== undefined) {    // ISE when getting congregation info
        console.log('Query Error in /api/state: ', result!)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
    }

    const rawCongregations: Congregation[] = (result! as [Congregation[], FieldPacket[]])[0]
    const congregations: CongregationSlug[] = rawCongregations.map(raw => {
        return {
            congregation_id: raw.congregation_id,
            state: {
                state_id: raw.state_id,
                empire: raw.empire,
                state_name: raw.state_name,
                state_tax_rate: raw.state_tax_rate,
                state_owner_firstname: raw.state_owner_first_name,
                state_owner_lastname: raw.state_owner_last_name
            },
            empire: raw.empire,
            congregation_name: raw.congregation_name,
            congregation_status: raw.congregation_status,
            congregation_tax_rate: raw.congregation_tax_rate,
            labor_split: raw.labor_split,
            congregation_owner_firstname: raw.congregation_owner_first_name,
            congregation_owner_lastname: raw.congregation_owner_last_name
        }
    })

    return NextResponse.json({ congregations: congregations }, { status: 200 })
}