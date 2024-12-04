import { dbGetBusinessesByOwner, dbGetUser, dbGetWorkersByBusinessId } from "@/app/db/query"
import { Business, BusinessSlug, User, WorkerSlug, Worker } from "@/customs/utils/types"
import { businessesToSlugs, workersToSlugs } from "@/customs/utils/tools"
import { NextRequest, NextResponse } from "next/server"
import { FieldPacket, QueryError } from "mysql2"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    if (request.method !== 'GET')
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })

    const cookieList = await cookies()

    if (!cookieList.has('username'))
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })

    const outcome: [User[], FieldPacket[]] | QueryError = await dbGetUser(cookieList.get('username')!.value)   // get user

    if ((outcome as QueryError).code !== undefined || (outcome as [User[], FieldPacket[]])[0].length === 0)
        return NextResponse.json({ error: 'User Not Found' }, { status: 500 })

    const user: User = (outcome as [User[], FieldPacket[]])[0][0]

    const response: [Business[], FieldPacket[]] | QueryError = await dbGetBusinessesByOwner(user.username)  // get business

    if ((response as QueryError).code !== undefined)
        return NextResponse.json({ error: 'Business Search Failed' }, { status: 500 })

    const rawBusinessesData: Business[] = (response as [Business[], FieldPacket[]])[0]

    const businesses: BusinessSlug[] = businessesToSlugs(rawBusinessesData)

    const pageData: { business: BusinessSlug, workers: WorkerSlug[] }[] = []

    for (const business of businesses) {
        const result: QueryError | [Worker[], FieldPacket[]] = await dbGetWorkersByBusinessId(business.business_id)   // get worker data for priveleged view

        if ((result as QueryError).code !== undefined) {
            console.log(result)
            return NextResponse.json({ error: 'Workers Search Failed' }, { status: 500 })
        }

        const rawWorkerData: Worker[] = (result as [Worker[], FieldPacket[]])[0]

        const workers: WorkerSlug[] = workersToSlugs(rawWorkerData)

        pageData.push({ business: business, workers: workers })
    }

    return NextResponse.json(pageData, { status: 200 })
}