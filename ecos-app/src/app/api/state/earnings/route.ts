import { getAllStateOwnersBusinessesEarningData } from "@/customs/utils/math/earnings"
import { BusinessEarningComponents, GenericError } from "@/customs/utils/types"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    if (request.method !== 'GET')
        return NextResponse.json({ error: 'METHOD NOT ALLOWED' }, { status: 405 })

    const cookieList = await cookies()

    if (!cookieList.has('username'))
        return NextResponse.json({ error: 'BAD REQUEST' }, { status: 401 })

    const earnings: BusinessEarningComponents[] | GenericError = await getAllStateOwnersBusinessesEarningData(cookieList.get('username')!.value)

    if ((earnings as GenericError).error !== undefined)
        return NextResponse.json(earnings as GenericError, { status: 500 })

    return NextResponse.json(earnings, { status: 200 })
}