import { dbGetBusinessById, dbGetBusinessesByOwner, dbGetBusinessesInEmpire } from "@/app/db/query"
import { Business, BusinessSlug } from "@/customs/utils/types"
import { NextRequest, NextResponse } from "next/server"
import { FieldPacket, QueryError } from "mysql2"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    if (request.method !== 'GET')
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })

    const cookieList = await cookies()

    if (!cookieList.has('username'))
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })

    const result: [Business[], FieldPacket[]] | QueryError = await dbGetBusinessesByOwner(cookieList.get('username')!.value)

    if ((result! as QueryError).code !== undefined) {    // ISE when getting business info
        console.log('Query Error in /api/business: ', result!)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
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

export async function POST(request: NextRequest) {
    if (request.method !== 'POST') 
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })
    
    const data = await request.json()

    if ((!data.empire || isNaN(data.empire)) && (!data.businessId))
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 }) 

    let result: [Business[], FieldPacket[]] | QueryError

    if (data.empire)
        result = await dbGetBusinessesInEmpire(data.empire)
    else if (data.businessId) 
        result = await dbGetBusinessById(data.businessId)

    if ((result! as QueryError).code !== undefined || (result! as [Business[], FieldPacket[]])[0].length === 0) {    // ISE when getting business info
        console.log('Query Error in /api/business: ', result!)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
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