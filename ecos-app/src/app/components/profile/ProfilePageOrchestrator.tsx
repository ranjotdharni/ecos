'use client'

import { API_USER_DETAILS_ROUTE } from "@/customs/utils/constants"
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
        <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>
            {
                loader || user === undefined ?
                <div style={{width: 50, aspectRatio: 1}}><Loading color='var(--color--text)' /></div> :
                <>
                    <ProfileHeader user={user} />
                    <ProfileContent user={user} />
                    <div style={{width: '100%', height: '60%', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}}>
                        <UserSearch client={user} />
                        <FriendsList client={user} />
                    </div>
                </>
            }
        </div>
    )
}