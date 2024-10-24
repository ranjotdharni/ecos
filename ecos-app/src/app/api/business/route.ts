import { dbGetBusinessesInEmpire } from "@/app/db/query"
import { NextRequest, NextResponse } from "next/server"
import { Business } from "@/customs/utils/types"
import { FieldPacket, QueryError } from "mysql2"

export async function POST(request: NextRequest) {
    if (request.method !== 'POST') 
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })
    
    const data = await request.json()

    if (!data.empire || isNaN(data.empire))
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 }) 

    const result: [Business[], FieldPacket[]] | QueryError = await dbGetBusinessesInEmpire(data.empire)

    if ((result as QueryError).code !== undefined || (result as [Business[], FieldPacket[]])[0].length === 0) {    // ISE when getting business info
        console.log('Query Error in /api/user: ', result)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
    }

    const businesses: Business[] = (result as [Business[], FieldPacket[]])[0]

    return NextResponse.json({ businesses: businesses }, { status: 200 })
}