import CongregationOwnerView from "@/app/components/congregation/[id]/CongregationOwnerView"
import CongregationBasicView from "@/app/components/congregation/[id]/CongregationBasicView"
import { Congregation, CongregationSlug, GenericError, User } from "@/customs/utils/types"
import { AUTH_ROUTE, NOT_FOUND_PAGE_ROUTE } from "@/customs/utils/constants"
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { dbGetCongregationById, dbGetUser } from "@/app/db/query"
import { congregationsToSlugs } from "@/customs/utils/tools"
import { FieldPacket, QueryError } from "mysql2"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import styles from "./page.module.css"

export default async function ViewCongregationPage({ params } : { params: Promise<{ id: string }> }) {
    async function getPageProps(): Promise<JSX.Element | JSX.Element[]> {
        const cookieList = cookies()

        const congregationId: string = (await params).id
        const username: RequestCookie | undefined = cookieList.get('username')  // ensure session cookies are present

        if (username === undefined) // redirect to auth otherwise
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}`)

        const outcome: [User[], FieldPacket[]] | QueryError = await dbGetUser(username.value)   // get user

        if ((outcome as QueryError).code !== undefined || (outcome as [User[], FieldPacket[]])[0].length === 0)
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}`)

        const user: User = (outcome as [User[], FieldPacket[]])[0][0]

        const response: [Congregation[], FieldPacket[]] | GenericError = await dbGetCongregationById(congregationId)  // get congregation

        if ((response as GenericError).error !== undefined || (response as [Congregation[], FieldPacket[]])[0].length === 0)
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NOT_FOUND_PAGE_ROUTE}`)

        const rawCongregationData: Congregation = (response as [Congregation[], FieldPacket[]])[0][0]

        const congregation: CongregationSlug = congregationsToSlugs([rawCongregationData])[0]

        if (rawCongregationData.congregation_owner_id === user.user_id) {   // if user is congregation owner, return priveleged view
            return <CongregationOwnerView congregation={congregation} />
        }
        else {  // otherwise return basic congregation view
            return <CongregationBasicView congregation={congregation} />
        }
    }

    return (
        <section className={styles.page}>
            {await getPageProps()}
        </section>
    )
}