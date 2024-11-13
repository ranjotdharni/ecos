import { getAllOwnersBusinessesEarningData, getBusinessEarningData } from "@/customs/utils/math/earnings"
import { Business, BusinessEarningComponents, GenericError, User } from "@/customs/utils/types"
import { dbGetBusinessById, dbGetUser } from "@/app/db/query"
import { NextRequest, NextResponse } from "next/server"
import { FieldPacket, QueryError } from "mysql2"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    if (request.method !== 'GET')
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })

    const cookieList = await cookies()

    if (!cookieList.has('username'))
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })

    const earnings: BusinessEarningComponents[] | GenericError = await getAllOwnersBusinessesEarningData(cookieList.get('username')!.value)

    return NextResponse.json(earnings, { status: 200 })
}

export async function POST(request: NextRequest) {
    if (request.method !== 'POST')
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })

    const cookieList = await cookies()
    const data = await request.json()

    if (!cookieList.has('username') || data.businessId === undefined)
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })

    const userOutput: [User[], FieldPacket[]] | QueryError = await dbGetUser(cookieList.get('username')!.value)

    if ((userOutput as QueryError).code !== undefined) {    // ISE when getting user info
        console.log('query error in /api/business/earnings', userOutput)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
    }

    const user: User = (userOutput as [User[], FieldPacket[]])[0][0]

    const businessOutput: [Business[], FieldPacket[]] | QueryError = await dbGetBusinessById(data.businessId)

    if ((businessOutput as QueryError).code !== undefined) {    // ISE when getting business info
        console.log('query error in /api/business/earnings', businessOutput)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
    }

    if ((businessOutput as [Business[], FieldPacket[]])[0].length === 0) {    // business not found
        console.log('business not found in /api/business/earnings')
        return NextResponse.json({ error: 'Business Not Found' }, { status: 404 })
    }

    const business: Business = (businessOutput as [Business[], FieldPacket[]])[0][0]

    if (user.user_id !== business.business_owner_id)    // requester does not own this business
        return NextResponse.json({ error: 'You do not own this Business' }, { status: 403 })

    const earnings: BusinessEarningComponents | GenericError = await getBusinessEarningData(business)

    return NextResponse.json(earnings, { status: 200 })
}