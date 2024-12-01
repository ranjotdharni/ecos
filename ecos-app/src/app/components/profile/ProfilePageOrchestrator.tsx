'use client'

import { API_USER_DETAILS_ROUTE } from "@/customs/utils/constants"
import styles from "./css/profilePageOrchestrator.module.css"
import { UserDetails } from "@/customs/utils/types"
import ProfileContent from "./ProfileContent"
import ProfileHeader from "./ProfileHeader"
import { useEffect, useState } from "react"
import FriendsList from "./FriendsList"
import UserSearch from "./UserSearch"
import Loading from "@/app/loading"


export default function ProfilePageOrchestrator() {
    const [loader, setLoader] = useState<boolean>(false)
    const [user, setUser] = useState<UserDetails>()

    async function getUser() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_USER_DETAILS_ROUTE}`).then(result => {
            return result.json()
        }).then(result => {
            setUser(result)
        })

        setLoader(false)
    }

    useEffect(() => {
        getUser()
    }, [])

    return (
        <div className={styles.main}>
            {
                loader || user === undefined ?
                <div className={styles.loader}><Loading color='var(--color--text)' /></div> :
                <>
                    <ProfileHeader user={user} />
                    <ProfileContent user={user} />
                    <div className={styles.listsContainer}>
                        <UserSearch client={user} />
                        <FriendsList client={user} />
                    </div>
                </>
            }
        </div>
    )
}