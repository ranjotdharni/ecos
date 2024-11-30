import ProfilePageOrchestrator from "@/app/components/profile/[username]/ProfilePageOrchestrator"
import { AUTH_ROUTE, NOT_FOUND_PAGE_ROUTE } from "@/customs/utils/constants"
import { User, UserDetails } from "@/customs/utils/types"
import { usersToSlugs } from "@/customs/utils/tools"
import { FieldPacket, QueryError } from "mysql2"
import { dbGetUser } from "@/app/db/query"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import styles from "./page.module.css"

export default async function ProfilePage({ params } : { params: Promise<{ username: string }> }) {
    const cookieList = cookies()

    const username: string = (await params).username

    if (username === undefined) // redirect to auth otherwise
        redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}`)

    const outcome: [User[], FieldPacket[]] | QueryError = await dbGetUser(username)   // get user

    if ((outcome as QueryError).code !== undefined || (outcome as [User[], FieldPacket[]])[0].length === 0)
        redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NOT_FOUND_PAGE_ROUTE}`)

    const user: UserDetails = usersToSlugs((outcome as [User[], FieldPacket[]])[0])[0]

    return (
        <section className={styles.page}>
            <ProfilePageOrchestrator user={user} />
        </section>
    )
}