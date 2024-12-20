import { Business, BusinessSlug, GenericError } from "@/customs/utils/types"
import { dbGetBusinessesByCongregation } from "@/app/db/query"
import { NextRequest, NextResponse } from "next/server"
import { FieldPacket } from "mysql2"

export async function POST(request: NextRequest) {
    if (request.method !== 'POST') 
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })
    
    const data = await request.json()

    if (data.congregationId === undefined)
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 }) 

    const result: [Business[], FieldPacket[]] | GenericError = await dbGetBusinessesByCongregation(data.congregationId)

    if ((result as GenericError).error !== undefined) {    // ISE when getting business info
        console.log('Query Error in /api/business/congregation: ', result)
        return NextResponse.json({ error: (result as GenericError).message }, { status: 500 })
    }

    const rawBusinesses: Business[] = (result! as [Business[], FieldPacket[]])[0]
    const businesses: BusinessSlug[] = rawBusinesses.map(raw => {
        return {
            business_id: raw.business_id,
            congregation: {
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
            },
            business_name: raw.business_name,
            business_type: raw.business_type,
            base_earning_rate: raw.base_earning_rate,
            rank_earning_increase: raw.rank_earning_increase,
            worker_count: raw.worker_count,
            hiring: raw.hiring !== 0,
            business_owner_firstname: raw.business_owner_first_name,
            business_owner_lastname: raw.business_owner_last_name
        }
    })

    return NextResponse.json({ businesses: businesses }, { status: 200 })
}