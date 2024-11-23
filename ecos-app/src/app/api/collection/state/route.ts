import { Collection, CollectionSlug, Congregation, GenericError, State, User } from "@/customs/utils/types"
import { dbGetCollectionsByState, dbGetStateById, dbGetUser } from "@/app/db/query"
import { collectionsToSlugs } from "@/customs/utils/tools"
import { NextRequest, NextResponse } from "next/server"
import { FieldPacket, QueryError } from "mysql2"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
    if (request.method !== 'POST') 
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })

    const cookieList = await cookies()

    if (!cookieList.has('username'))
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })

    const username: string = cookieList.get('username')!.value

    const userCheck: [User[], FieldPacket[]] | QueryError = await dbGetUser(username)

    if ((userCheck as QueryError).code !== undefined || (userCheck as [User[], FieldPacket[]])[0].length === 0)
        return NextResponse.json({ error: true, message: 'INTERNAL SERVER ERROR (Failed to find User in database)'}, { status: 500 })

    const user: User = (userCheck as [User[], FieldPacket[]])[0][0]
    
    const data = await request.json()

    if (data.stateId === undefined)
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })
    
    const stateCheck: [State[], FieldPacket[]] | GenericError = await dbGetStateById(data.stateId)

    if ((stateCheck as GenericError).error !== undefined || (stateCheck as [Congregation[], FieldPacket[]])[0].length === 0)
        return NextResponse.json({ error: true, message: 'Failed to find State in database' } as GenericError, { status: 401 })

    const state: State = (stateCheck as [State[], FieldPacket[]])[0][0]

    if (user.user_id !== state.state_owner_id)
        return NextResponse.json({ error: true, message: 'You do not own this State' }, { status: 401 })

    const result: [Collection[], FieldPacket[]] | GenericError = await dbGetCollectionsByState(data.stateId)

    if ((result as GenericError).error !== undefined) {    // ISE when getting collection info
        console.log('Query Error in /api/collection/state: ', result)
        return NextResponse.json(result as GenericError, { status: 500 })
    }

    const rawCollections: Collection[] = (result! as [Collection[], FieldPacket[]])[0]
    const collections: CollectionSlug[] = collectionsToSlugs(rawCollections)

    return NextResponse.json(collections, { status: 200 })
}