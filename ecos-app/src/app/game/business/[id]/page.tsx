import { Business, BusinessSlug, User, Worker, WorkerSlug } from "@/customs/utils/types"
import { dbGetBusinessById, dbGetUser, dbGetWorkersByBusinessId } from "@/app/db/query"
import { AUTH_ROUTE, NOT_FOUND_PAGE_ROUTE } from "@/customs/utils/constants"
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"
import OwnerView from "@/app/components/business/id/OwnerView"
import BasicView from "@/app/components/business/id/BasicView"
import { FieldPacket, QueryError } from "mysql2"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import styles from "./page.module.css"


export default async function Page({ params } : { params: Promise<{ id: string }> }) {

    async function getPageProps(): Promise<JSX.Element | JSX.Element[]> {
        const cookieList = cookies()

        const businessId: string = (await params).id
        const username: RequestCookie | undefined = cookieList.get('username')  // ensure session cookies are present

        if (username === undefined) // redirect to auth otherwise
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}`)

        const outcome: [User[], FieldPacket[]] | QueryError = await dbGetUser(username.value)   // get user

        if ((outcome as QueryError).code !== undefined || (outcome as [User[], FieldPacket[]])[0].length === 0)
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}`)

        const user: User = (outcome as [User[], FieldPacket[]])[0][0]

        const response: [Business[], FieldPacket[]] | QueryError = await dbGetBusinessById(businessId)  // get business

        if ((response as QueryError).code !== undefined || (response as [Business[], FieldPacket[]])[0].length === 0)
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NOT_FOUND_PAGE_ROUTE}`)

        const rawBusinessData: Business = (response as [Business[], FieldPacket[]])[0][0]

        const business: BusinessSlug = {    // parse business data
            business_id: rawBusinessData.business_id,
            congregation: {
                congregation_id: rawBusinessData.congregation_id,
                state: {
                    state_id: rawBusinessData.state_id,
                    empire: rawBusinessData.empire,
                    state_name: rawBusinessData.state_name,
                    state_tax_rate: rawBusinessData.state_tax_rate,
                    state_owner_firstname: rawBusinessData.state_owner_first_name,
                    state_owner_lastname: rawBusinessData.state_owner_last_name
                },
                empire: rawBusinessData.empire,
                congregation_name: rawBusinessData.congregation_name,
                congregation_status: rawBusinessData.congregation_status,
                congregation_tax_rate: rawBusinessData.congregation_tax_rate,
                labor_split: rawBusinessData.labor_split,
                congregation_owner_firstname: rawBusinessData.congregation_owner_first_name,
                congregation_owner_lastname: rawBusinessData.congregation_owner_last_name
            },
            business_name: rawBusinessData.business_name,
            business_type: rawBusinessData.business_type,
            base_earning_rate: rawBusinessData.base_earning_rate,
            rank_earning_increase: rawBusinessData.rank_earning_increase,
            worker_count: rawBusinessData.worker_count,
            hiring: rawBusinessData.hiring !== 0,
            business_owner_firstname: rawBusinessData.business_owner_first_name,
            business_owner_lastname: rawBusinessData.business_owner_last_name
        }

        if (rawBusinessData.business_owner_id === user.user_id) {   // if user is business owner, return priveleged view
            const result: [Worker[], FieldPacket[]] | QueryError = await dbGetWorkersByBusinessId(businessId)   // get worker data for priveleged view

            if ((result as QueryError).code !== undefined) {
                console.log(result)
                redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NOT_FOUND_PAGE_ROUTE}`)
            }

            const rawWorkerData: Worker[] = (result as [Worker[], FieldPacket[]])[0]

            const workers: WorkerSlug[] = rawWorkerData.map(raw => {    // parse workers data
                return {
                    worker_id: raw.worker_id,
                    firstname: raw.worker_first_name,
                    lastname: raw.worker_last_name,
                    worker_rank: raw.worker_rank,
                    clocked_in: raw.clocked_in,
                    clocked_out: raw.clocked_out,
                    business: {
                        business_id: raw.business_id,
                        congregation: {
                            congregation_id: raw.congregation_id,
                            state: {
                                state_id: raw.state_id,
                                empire: raw.empire,
                                state_name: raw.state_name,
                                state_tax_rate: raw.state_tax_rate,
                                state_owner_firstname: raw.state_owner_first_name,
                                state_owner_lastname: raw.state_owner_last_name
                            },
                            empire: raw.empire,
                            congregation_name: raw.congregation_name,
                            congregation_status: raw.congregation_status,
                            congregation_tax_rate: raw.congregation_tax_rate,
                            labor_split: raw.labor_split,
                            congregation_owner_firstname: raw.congregation_owner_first_name,
                            congregation_owner_lastname: raw.congregation_owner_last_name
                        },
                        business_name: raw.business_name,
                        business_type: raw.business_type,
                        base_earning_rate: raw.base_earning_rate,
                        rank_earning_increase: raw.rank_earning_increase,
                        worker_count: raw.worker_count,
                        hiring: raw.hiring !== 0,
                        business_owner_firstname: raw.business_owner_first_name,
                        business_owner_lastname: raw.business_owner_last_name
                    }
                }
            })

            return <OwnerView workers={workers} />
        }
        else {  // otherwise return basic business view
            return <BasicView business={business} />
        }
    }

    return (
        <section className={styles.page}>
            {await getPageProps()}
        </section>
    )
}