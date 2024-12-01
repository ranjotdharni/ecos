import { Friend, FriendSlug, GenericError, Request, User, UserDetails } from "@/customs/utils/types"
import ProfilePageOrchestrator from "@/app/components/profile/[username]/ProfilePageOrchestrator"
import { AUTH_ROUTE, NOT_FOUND_PAGE_ROUTE, PROFILE_PAGE_ROUTE } from "@/customs/utils/constants"
import { friendsToSlugs, requestsToSlugs, usersToSlugs } from "@/customs/utils/tools"
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { dbGetFriends, dbGetRequests, dbGetUser } from "@/app/db/query"
import { FieldPacket, QueryError } from "mysql2"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import styles from "./page.module.css"

export default async function ProfilePage({ params } : { params: Promise<{ username: string }> }) {
    const cookieList = cookies()

    const client: RequestCookie | undefined = cookieList.get('username')

    if (client === undefined)
        redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}`)

    const clientUsername: string = client.value

    const username: string = (await params).username

    if (username === undefined || username === clientUsername) // redirect to auth otherwise
        redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${PROFILE_PAGE_ROUTE}`)

    const outcome: [User[], FieldPacket[]] | QueryError = await dbGetUser(username)   // get user

    if ((outcome as QueryError).code !== undefined || (outcome as [User[], FieldPacket[]])[0].length === 0)
        redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NOT_FOUND_PAGE_ROUTE}`)

    const user: UserDetails = usersToSlugs((outcome as [User[], FieldPacket[]])[0])[0]

    const requestCheck: [Request[], FieldPacket[]] | GenericError = await dbGetRequests(user.user_id)

    if ((requestCheck as GenericError).error !== undefined)
        redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NOT_FOUND_PAGE_ROUTE}`)

    const request: Request | undefined = (requestCheck as [Request[], FieldPacket[]])[0].find(r => r.from_username === clientUsername || r.to_username === clientUsername)
    
    if (request !== undefined) {
        return (
            <section className={styles.page}>
                <ProfilePageOrchestrator user={user} r={requestsToSlugs([request])[0]} />
            </section>
        )
    }
    else {
        const friendCheck: [Friend[], FieldPacket[]] | GenericError = await dbGetFriends(user.user_id)

        if ((friendCheck as GenericError).error !== undefined)
            redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NOT_FOUND_PAGE_ROUTE}`)

        const friend: FriendSlug | undefined = friendsToSlugs((friendCheck as [Friend[], FieldPacket[]])[0]).find(f => f.friend1.username === clientUsername || f.friend2.username === clientUsername)

        return (
            <section className={styles.page}>
                <ProfilePageOrchestrator user={user} f={friend} />
            </section>
        )
    }
}