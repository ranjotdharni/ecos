import { Business, Collection, CollectionSlug, GenericError, User } from "@/customs/utils/types"
import { dbGetBusinessById, dbGetCollectionsByBusiness, dbGetUser } from "@/app/db/query"
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

    if (data.businessId === undefined)
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })
    
    const businessCheck: [Business[], FieldPacket[]] | QueryError = await dbGetBusinessById(data.businessId)

    if ((businessCheck as QueryError).code !== undefined || (businessCheck as [Business[], FieldPacket[]])[0].length === 0)
        return NextResponse.json({ error: true, message: 'Failed to find Congregation in database' } as GenericError, { status: 401 })

    const business: Business = (businessCheck as [Business[], FieldPacket[]])[0][0]

    if (user.user_id !== business.business_owner_id)
        return NextResponse.json({ error: true, message: 'You do not own this Business' }, { status: 401 })

    const result: [Collection[], FieldPacket[]] | GenericError = await dbGetCollectionsByBusiness(data.businessId)

    if ((result as GenericError).error !== undefined) {    // ISE when getting collection info
        console.log('Query Error in /api/collection/business: ', result)
        return NextResponse.json({ error: (result as GenericError).message }, { status: 500 })
    }

    const rawCollections: Collection[] = (result! as [Collection[], FieldPacket[]])[0]
    const collections: CollectionSlug[] = collectionsToSlugs(rawCollections)

    return NextResponse.json(collections, { status: 200 })
}