'use client'

import { EmpireData, FriendSlug, GenericError, ProfileType, RequestSlug, UserDetails } from "@/customs/utils/types"
import { API_FRIEND_ROUTE, API_REQUEST_ROUTE, PROFILE_PAGE_ROUTE, SEARCH_ICON } from "@/customs/utils/constants"
import { sendFriendRequest, usernameSearch } from "@/customs/utils/actions"
import { ChangeEvent, MouseEvent, useEffect, useState } from "react"
import { PROFILE_DATA } from "@/app/server/profile"
import { EMPIRE_DATA } from "@/app/server/empire"
import styles from "./css/userSearch.module.css"
import useError from "@/customs/hooks/useError"
import Loading from "@/app/loading"

function UserItem({ user, requested, addToRequested, throwError } : { user: UserDetails, requested: boolean, addToRequested: (add: RequestSlug) => void, throwError: (error: string) => void }) {
    const [acceptLoader, setAcceptLoader] = useState<boolean>(false)

    const [pfp, setPfp] = useState<ProfileType | undefined>(PROFILE_DATA.find(p => p.code === Number(user.pfp)))
    const [empire, setEmpire] = useState<EmpireData | undefined>(EMPIRE_DATA.find(e => e.code === Number(user.empire)))

    async function sendRequest(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (acceptLoader || requested)
            return

        setAcceptLoader(true)

        await sendFriendRequest(user.username).then(result => {
            if ((result as GenericError).error !== undefined) {
                throwError((result as GenericError).message)
                return
            }

            addToRequested(result as RequestSlug)
        })

        setAcceptLoader(false)
    }

    return (
        <li className={styles.inviteItem}>
            <div className={styles.inviteItemHeader}>
                <img src={pfp?.icon} />
                <h3>{`${user.firstname} ${user.lastname}`}</h3>
            </div>
            <div className={styles.inviteItemBodyOne}>
                <p>{user.username}</p>
                <a href={`${PROFILE_PAGE_ROUTE}/${user.username}`}>View Profile</a>
            </div>
            <div className={styles.inviteItemBodyTwo}>
                <p>{empire?.name}</p>
                <img src={empire?.sigil.src} />
            </div>
            <div className={styles.inviteItemFooter}>
                <button onClick={sendRequest}>
                    {
                        acceptLoader ? 
                        <div className={styles.buttonLoader}><Loading color='var(--color--text)' /></div> : 
                        (requested ? 'Pending' : 'Add Friend')
                    }
                </button>
            </div>
        </li>
    )
}

export default function UserSearch({ client } : { client: UserDetails }) {
    const [error, throwError] = useError()
    const [loader, setLoader] = useState<boolean>(false)

    const [searchQuery, setSearchQuery] = useState<string>('')
    const [users, setUsers] = useState<UserDetails[]>([])
    const [friends, setFriends] = useState<FriendSlug[]>()
    const [requests, setRequests] = useState<RequestSlug[]>()

    function editSearchQuery(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()

        setSearchQuery(event.target.value)
    }

    function addToRequested(add: RequestSlug) {
        const newRequests: RequestSlug[] = [...requests!]
        newRequests.push(add)
        setRequests(newRequests)
    }

    async function searchForUsername(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (loader)
            return

        setLoader(true)

        await usernameSearch(searchQuery.trim()).then(result => {
            if ((result as GenericError).error !== undefined) {
                throwError((result as GenericError).message)
                return
            }

            setUsers(result as UserDetails[])
        })

        setLoader(false)
    }

    async function getComponentData() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_FRIEND_ROUTE}`).then(result => {
            return result.json()
        }).then(result => {
            if (result.error) {
                throwError(result.message)
                return
            }

            setFriends(result)
        })

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_REQUEST_ROUTE}`).then(result => {
            return result.json()
        }).then(result => {
            if (result.error) {
                throwError(result.message)
                return
            }

            setRequests(result)
        })

        setLoader(false)
    }

    useEffect(() => {
        getComponentData()
    }, [])

    return (
        <div className={styles.container}>
            <p className={styles.error}>{error}</p>
            <div className={styles.headerContainer}>
                <img src={SEARCH_ICON} />
                <h2>Find Friends</h2>
            </div>
            <div className={styles.searchContainer}>
                <input placeholder='Search By Username' value={searchQuery} onChange={editSearchQuery} />
                <button onClick={searchForUsername}>Search</button>
            </div>
            <ul className={`${styles.resultsContainer} ${loader ? styles.listCenter : ''}`}>
                {
                    loader || friends === undefined || requests === undefined ? 
                    <div className={styles.loader}><Loading color='var(--color--text)' /></div> :
                    users.filter(u => u.user_id !== client.user_id && friends.find(f => f.friend1.user_id === u.user_id || f.friend2.user_id === u.user_id) === undefined).map(user => {
                        return (
                            <UserItem user={user} requested={requests.find(r => r.to.user_id === user.user_id) !== undefined} addToRequested={addToRequested} throwError={throwError} />
                        )
                    })
                }
            </ul>
        </div>
    )
}