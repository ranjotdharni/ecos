'use client'

import { EmpireData, FriendSlug, GenericError, ProfileType, UserDetails } from "@/customs/utils/types"
import { API_FRIEND_ROUTE, FRIENDS_ICON, PROFILE_PAGE_ROUTE } from "@/customs/utils/constants"
import { undoFriends, usernameSearch } from "@/customs/utils/actions"
import { ChangeEvent, MouseEvent, useEffect, useState } from "react"
import { dateToFormat } from "@/customs/utils/tools"
import { PROFILE_DATA } from "@/app/server/profile"
import { EMPIRE_DATA } from "@/app/server/empire"
import styles from "./css/friendsList.module.css"
import useError from "@/customs/hooks/useError"
import Loading from "@/app/loading"

function UserItem({ data, user, since, addToRequested, throwError } : { data: FriendSlug, user: UserDetails, since: Date, addToRequested: (add: FriendSlug) => void, throwError: (error: string) => void }) {
    const [acceptLoader, setAcceptLoader] = useState<boolean>(false)

    const [pfp, setPfp] = useState<ProfileType | undefined>(PROFILE_DATA.find(p => p.code === Number(user.pfp)))
    const [empire, setEmpire] = useState<EmpireData | undefined>(EMPIRE_DATA.find(e => e.code === Number(user.empire)))

    async function sendRequest(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (acceptLoader)
            return

        setAcceptLoader(true)

        await undoFriends(user.user_id).then(result => {
            throwError(result.message)

            if ((result as GenericError).error !== undefined) {
                return
            }

            addToRequested(data)
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
                <p>{dateToFormat('MMM DD, YYYY', new Date(since))}</p>
                <button onClick={sendRequest}>
                    {
                        acceptLoader ? 
                        <div className={styles.buttonLoader}><Loading color='var(--color--text)' /></div> : 
                        'Remove Friend'
                    }
                </button>
            </div>
        </li>
    )
}

export default function FriendsList({ client } : { client: UserDetails }) {
    const [error, throwError] = useError()
    const [loader, setLoader] = useState<boolean>(false)

    const [searchQuery, setSearchQuery] = useState<string>('')
    const [users, setUsers] = useState<UserDetails[]>([])
    const [friends, setFriends] = useState<FriendSlug[]>()
    const [requests, setRequests] = useState<FriendSlug[]>([])

    function editSearchQuery(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()

        setSearchQuery(event.target.value)
    }

    function addToRequested(add: FriendSlug) {
        const newRequests: FriendSlug[] = [...requests!]
        newRequests.push(add)
        setRequests(newRequests)
    }

    async function searchForUsername(event: ChangeEvent<HTMLInputElement>) {
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

        /*await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_REQUEST_ROUTE}`).then(result => {
            return result.json()
        }).then(result => {
            if (result.error) {
                throwError(result.message)
                return
            }

            setRequests(result)
        })*/

        setLoader(false)
    }

    useEffect(() => {
        getComponentData()
    }, [])

    return (
        <div className={styles.container}>
            <p className={styles.error}>{error}</p>
            <div className={styles.headerContainer}>
                <img src={FRIENDS_ICON} />
                <h2>Friends List</h2>
            </div>
            <div className={styles.searchContainer}>
                <input placeholder='Filter By Username' value={searchQuery} onChange={editSearchQuery} />
            </div>
            <ul className={`${styles.resultsContainer} ${loader ? styles.listCenter : ''}`}>
                {
                    loader || friends === undefined || requests === undefined ? 
                    <div className={styles.loader}><Loading color='var(--color--text)' /></div> :
                    friends.filter(friendship => requests.find(r => r.friend1.user_id === friendship.friend1.user_id || r.friend1.user_id === friendship.friend2.user_id || r.friend2.user_id === friendship.friend1.user_id || r.friend2.user_id === friendship.friend2.user_id) === undefined).filter(f => f.friend1.user_id === client.user_id ? f.friend2.username.toLowerCase().includes(searchQuery.trim().toLowerCase()) : f.friend1.username.toLowerCase().includes(searchQuery.trim().toLowerCase())).map(f => {
                        return (
                            <UserItem data={f} user={f.friend1.user_id === client.user_id ? f.friend2 : f.friend1} addToRequested={addToRequested} throwError={throwError} since={f.since} />
                        )
                    })
                }
            </ul>
        </div>
    )
}