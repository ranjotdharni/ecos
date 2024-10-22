import { NextRequest, NextResponse } from "next/server"
import { getAuthentication } from "@/app/server/auth"

// Error always gives forbidden because only server should access this route, 
// it thereby inherently does so correctly
export async function POST(request: NextRequest) {
    if (request.method !== 'POST') 
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    
    const data = await request.json()

    if (!data.username || !data.token || !data.key || data.key !== process.env.API_KEY)
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 }) 

    const session: number = await getAuthentication(data.username, data.token)

    return NextResponse.json({ session: session }, { status: 200 })
}