import { Collection, CollectionSlug, Congregation, GenericError, User } from "@/customs/utils/types"
import { dbGetCollectionsByCongregation, dbGetCongregationById, dbGetUser } from "@/app/db/query"
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

    if (data.congregationId === undefined)
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })
    
    const congregationCheck: [Congregation[], FieldPacket[]] | GenericError = await dbGetCongregationById(data.congregationId)

    if ((congregationCheck as GenericError).error !== undefined || (congregationCheck as [Congregation[], FieldPacket[]])[0].length === 0)
        return NextResponse.json({ error: true, message: 'Failed to find Congregation in database' } as GenericError, { status: 401 })

    const congregation: Congregation = (congregationCheck as [Congregation[], FieldPacket[]])[0][0]

    if (user.user_id !== congregation.congregation_owner_id)
        return NextResponse.json({ error: true, message: 'You do not own this Congregation' }, { status: 401 })

    const result: [Collection[], FieldPacket[]] | GenericError = await dbGetCollectionsByCongregation(data.congregationId)

    if ((result as GenericError).error !== undefined) {    // ISE when getting collection info
        console.log('Query Error in /api/collection/congregation: ', result)
        return NextResponse.json({ error: (result as GenericError).message }, { status: 500 })
    }

    const rawCollections: Collection[] = (result! as [Collection[], FieldPacket[]])[0]
    const collections: CollectionSlug[] = collectionsToSlugs(rawCollections)

    return NextResponse.json(collections, { status: 200 })
}