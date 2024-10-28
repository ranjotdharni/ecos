import { NextRequest, NextResponse } from "next/server"
import { FieldPacket, QueryError } from "mysql2"
import { Worker } from "@/customs/utils/types"
import { dbGetJobs } from "@/app/db/query"

export async function POST(request: NextRequest) {
    if (request.method !== 'POST') 
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })
    
    const data = await request.json()

    if (!data.username)
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 }) 

    const result: [Worker[], FieldPacket[]] | QueryError = await dbGetJobs(data.username)

    if ((result as QueryError).code !== undefined) {    // ISE when getting worker info
        console.log('Query Error in /api/user: ', result)
        return NextResponse.json({ error: 'INTERNAL SERVER ERROR' }, { status: 500 })
    }

    if ((result as [Worker[], FieldPacket[]])[0].length === 0)
        return NextResponse.json({ empty: true }, { status: 200 })

    const rawWorkers: Worker[] = (result as [Worker[], FieldPacket[]])[0]
    const worker: Worker = rawWorkers[0]

    return NextResponse.json({ worker: worker }, { status: 200 })
}