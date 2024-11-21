import BusinessContent from "@/app/components/business/page/BusinessContent"
import BusinessHeader from "@/app/components/business/page/BusinessHeader"
import styles from "./page.module.css"
import { Business, Worker, BusinessSlug, User, WorkerSlug } from "@/customs/utils/types"
import { cookies } from "next/headers"
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { redirect } from "next/navigation"
import { AUTH_ROUTE, NOT_FOUND_PAGE_ROUTE } from "@/customs/utils/constants"
import { FieldPacket, QueryError } from "mysql2"
import { dbGetBusinessesByOwner, dbGetUser, dbGetWorkersByBusinessId } from "@/app/db/query"
import { businessesToSlugs, workersToSlugs } from "@/customs/utils/tools"

export default async function BusinessPage() {
    async function getPageHeaderProps(): Promise<{ business: BusinessSlug, workers: WorkerSlug[] }[]> {
        const cookieList = cookies()
        const username: RequestCookie | undefined = cookieList.get('username')  // ensure session cookies are present

        if (username === undefined) // redirect to auth otherwise
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}`)

        const outcome: [User[], FieldPacket[]] | QueryError = await dbGetUser(username.value)   // get user

        if ((outcome as QueryError).code !== undefined || (outcome as [User[], FieldPacket[]])[0].length === 0)
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}`)

        const user: User = (outcome as [User[], FieldPacket[]])[0][0]

        const response: [Business[], FieldPacket[]] | QueryError = await dbGetBusinessesByOwner(user.username)  // get business

        if ((response as QueryError).code !== undefined)
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NOT_FOUND_PAGE_ROUTE}`)

        const rawBusinessesData: Business[] = (response as [Business[], FieldPacket[]])[0]

        const businesses: BusinessSlug[] = businessesToSlugs(rawBusinessesData)

        const pageData: { business: BusinessSlug, workers: WorkerSlug[] }[] = []

        for (const business of businesses) {
            const result: QueryError | [Worker[], FieldPacket[]] = await dbGetWorkersByBusinessId(business.business_id)   // get worker data for priveleged view

            if ((result as QueryError).code !== undefined) {
                console.log(result)
                redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NOT_FOUND_PAGE_ROUTE}`)
            }

            const rawWorkerData: Worker[] = (result as [Worker[], FieldPacket[]])[0]

            const workers: WorkerSlug[] = workersToSlugs(rawWorkerData)

            pageData.push({ business: business, workers: workers })
        }

        return pageData
    }

    return (
        <section className={styles.page}>
            <BusinessHeader props={await getPageHeaderProps()} />
            <BusinessContent />
        </section>
    )
}