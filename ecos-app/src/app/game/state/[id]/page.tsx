import { BusinessEarningComponents, Congregation, CongregationSlug, GenericError, State, StateSlug, User } from "@/customs/utils/types"
import { dbGetCongregationsByState, dbGetStateById, dbGetUser } from "@/app/db/query"
import { getAllStatesBusinessesEarningData } from "@/customs/utils/math/earnings"
import { AUTH_ROUTE, NOT_FOUND_PAGE_ROUTE } from "@/customs/utils/constants"
import { congregationsToSlugs, statesToSlugs } from "@/customs/utils/tools"
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"
import StateBasicView from "@/app/components/state/[id]/StateBasicView"
import StateOwnerView from "@/app/components/state/[id]/StateOwnerView"
import { FieldPacket, QueryError } from "mysql2"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import styles from "./page.module.css"

export default async function ViewStatePage({ params } : { params: Promise<{ id: string }> }) {
    async function getPageProps(): Promise<JSX.Element | JSX.Element[]> {
        const cookieList = cookies()

        const stateId: string = (await params).id
        const username: RequestCookie | undefined = cookieList.get('username')  // ensure session cookies are present

        if (username === undefined) // redirect to auth otherwise
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}`)

        const outcome: [User[], FieldPacket[]] | QueryError = await dbGetUser(username.value)   // get user

        if ((outcome as QueryError).code !== undefined || (outcome as [User[], FieldPacket[]])[0].length === 0)
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}`)

        const user: User = (outcome as [User[], FieldPacket[]])[0][0]

        const response: [State[], FieldPacket[]] | GenericError = await dbGetStateById(stateId)  // get congregation

        if ((response as GenericError).error !== undefined || (response as [State[], FieldPacket[]])[0].length === 0)
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NOT_FOUND_PAGE_ROUTE}`)

        const rawStateData: State = (response as [State[], FieldPacket[]])[0][0]

        const state: StateSlug = statesToSlugs([rawStateData])[0]

        const result: [Congregation[], FieldPacket[]] | GenericError = await dbGetCongregationsByState(stateId)

        if ((result as GenericError).error !== undefined) {
            console.log((result as GenericError).message)
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NOT_FOUND_PAGE_ROUTE}`)
        }

        const congregations: CongregationSlug[] = congregationsToSlugs((result as [Congregation[], FieldPacket[]])[0])

        if (rawStateData.state_owner_id === user.user_id) {   // if user is congregation owner, return priveleged view
            const stateBusinessesEarnings: BusinessEarningComponents[] | GenericError = await getAllStatesBusinessesEarningData(rawStateData.state_id)

            if ((stateBusinessesEarnings as GenericError).error !== undefined) {
                console.log((stateBusinessesEarnings as GenericError).message)
                return <StateBasicView state={state} congregations={congregations} />
            }

            return <StateOwnerView state={state} congregations={congregations} earnings={stateBusinessesEarnings as BusinessEarningComponents[]} />
        }
        else {  // otherwise return basic congregation view
            return <StateBasicView state={state} congregations={congregations} />
        }
    }

    return (
        <section className={styles.page}>
            {await getPageProps()}
        </section>
    )
}