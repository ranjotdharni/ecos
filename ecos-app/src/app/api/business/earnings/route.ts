import { dbGetBusinessById, dbGetBusinessesByOwner, dbGetBusinessesEarnings, dbGetBusinessesInEmpire } from "@/app/db/query"
import { Business, BusinessEarnings, BusinessSlug } from "@/customs/utils/types"
import { NextRequest, NextResponse } from "next/server"
import { FieldPacket, QueryError } from "mysql2"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    if (request.method !== 'GET')
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })

    const cookieList = await cookies()

    if (!cookieList.has('username'))
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })

    const output: [BusinessEarnings[], FieldPacket[]] | QueryError = await dbGetBusinessesEarnings(cookieList.get('username')!.value)

    if ((output as QueryError).code !== undefined) {    // ISE when getting business earnings info
        console.log('query error in /api/business/earnings', output)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
    }

    const earnings: BusinessEarnings[] = (output as [BusinessEarnings[], FieldPacket[]])[0]

    return NextResponse.json({ earnings: earnings }, { status: 200 })
}