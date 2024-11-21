import { Business, BusinessSlug, User } from "@/customs/utils/types"
import { dbGetBusinessesInEmpire, dbGetUser } from "@/app/db/query"
import { businessesToSlugs } from "@/customs/utils/tools"
import { NextRequest, NextResponse } from "next/server"
import { FieldPacket, QueryError } from "mysql2"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    if (request.method !== 'GET')
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })

    const cookieList = await cookies()

    if (!cookieList.has('username'))
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })

    const result: [User[], FieldPacket[]] | QueryError = await dbGetUser(cookieList.get('username')!.value)

    if ((result as QueryError).code !== undefined || (result as [User[], FieldPacket[]])[0].length === 0) {    // ISE when getting user info
        console.log('Query Error in /api/business/empire: ', result)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR (Failed to Find User)' }, { status: 500 })
    }

    const user: User = (result as [User[], FieldPacket[]])[0][0]

    if (user.empire === null)
        return NextResponse.json({ error: 'You have not selected an empire yet' }, { status: 401 })

    const businessesResult: [Business[], FieldPacket[]] | QueryError = await dbGetBusinessesInEmpire(user.empire)

    if ((businessesResult as QueryError).code !== undefined)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR (Failed to Find Businesses)' }, { status: 500 })

    const rawBusinesses: Business[] = (businessesResult as [Business[], FieldPacket[]])[0]
    const businesses: BusinessSlug[] = businessesToSlugs(rawBusinesses)

    return NextResponse.json(businesses, { status: 200 })
}