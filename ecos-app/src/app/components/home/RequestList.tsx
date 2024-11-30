'use client'

import { EmpireData, GenericSuccess, ProfileType, RequestSlug, UserDetails } from "@/customs/utils/types"
import { acceptFriendRequest, declineFriendRequest } from "@/customs/utils/actions"
import { API_REQUEST_ROUTE, REQUEST_ICON } from "@/customs/utils/constants"
import { MouseEvent, useContext, useEffect, useState } from "react"
import { dateToFormat, fetchUser } from "@/customs/utils/tools"
import { UserContext } from "../context/UserProvider"
import { PROFILE_DATA } from "@/app/server/profile"
import { EMPIRE_DATA } from "@/app/server/empire"
import styles from "./css/requestList.module.css"
import Loading from "@/app/loading"

function StateInviteItem({ invite, clearInvite, throwError } : { invite: RequestSlug, clearInvite: (clear: RequestSlug) => void, throwError: (error: string) => void }): JSX.Element {
    const { setModal } = useContext(UserContext) 

    const [declineLoader, setDeclineLoader] = useState<boolean>(false)
    const [acceptLoader, setAcceptLoader] = useState<boolean>(false)

    const [from, setFrom] = useState<ProfileType | undefined>(PROFILE_DATA.find(p => p.code === Number(invite.from.pfp)))
    const [empire, setEmpire] = useState<EmpireData | undefined>(EMPIRE_DATA.find(e => e.code === Number(invite.from.empire)))

    async function declineInvite(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (declineLoader || acceptLoader)
            return

        async function decline() {
            setDeclineLoader(true)

            await declineFriendRequest(invite.from.user_id).then(result => {
                throwError(result.message)
                if ((result as GenericSuccess).success !== undefined) {
                    clearInvite(invite)
                }
            })

            setDeclineLoader(false)
        }

        setModal({
            title: 'Are You Sure?',
            message: `You are about to decline a Friend Request from ${invite.from.username}.`,
            question: 'Do you still want to continue?',
            callback: decline
        })
    }

    async function acceptUserInvite(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (declineLoader || acceptLoader)
            return

        async function accept() {
            setAcceptLoader(true)

            await acceptFriendRequest(invite.from.user_id).then(result => {
                throwError(result.message)
                if ((result as GenericSuccess).success !== undefined) {
                    clearInvite(invite)
                }
            })

            setAcceptLoader(false)
        }

        setModal({
            title: 'Are You Sure?',
            message: `You are about to accept a Friend Request from ${invite.from.username}.`,
            question: 'Do you still want to continue?',
            callback: accept
        })
    }

    return (
        <li className={styles.inviteItem}>
            <div className={styles.inviteItemHeader}>
                <img src={from?.icon} />
                <h3>{`${invite.from.firstname} ${invite.from.lastname}`}</h3>
            </div>
            <div className={styles.inviteItemBodyOne}>
                <p>{empire?.name}</p>
                <img src={empire?.sigil.src} />
            </div>
            <div className={styles.inviteItemBodyTwo}>
                <p>{invite.from.username}</p>
                <p>{`${dateToFormat('MM/DD/YYYY', new Date(invite.at))} ${new Date(invite.at).toLocaleTimeString('en-US', { hour12: true })}`}</p>
            </div>
            <div className={styles.inviteItemFooter}>
                <button onClick={declineInvite}>{declineLoader ? <div className={styles.buttonLoader}><Loading color='var(--color--text)' /></div> : 'Decline'}</button>
                <button onClick={acceptUserInvite}>{acceptLoader ? <div className={styles.buttonLoader}><Loading color='var(--color--text)' /></div> : 'Accept'}</button>
            </div>
        </li>
    )
}

export default function InviteList({ throwError } : { throwError: (error: string) => void }) {
    const [loader, setLoader] = useState<boolean>(false)
    const [invites, setInvites] = useState<(RequestSlug)[] | undefined>()
    const [cleared, setCleared] = useState<(RequestSlug)[]>([])

    function filterByCleared(invite: RequestSlug): boolean {
        return cleared.find(
            c => 
                c.from.user_id === invite.from.user_id && 
                c.to.user_id === invite.to.user_id
        ) === undefined
    }

    function clearInviteLocally(clear: RequestSlug) {
        const newCleared: (RequestSlug)[] = [...cleared]
        newCleared.push(clear)
        setCleared(newCleared)
    }

    function mapInviteToComponent(invite: RequestSlug): JSX.Element {
        return <StateInviteItem invite={invite as RequestSlug} clearInvite={clearInviteLocally} throwError={throwError} />
    }

    async function getInvites() {
        setLoader(true)

        const user: UserDetails = await fetchUser()

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_REQUEST_ROUTE}`).then(result => {
            return result.json()
        }).then(result => {
            if (result.error !== undefined) {
                throwError(result.message)
            }

            setInvites((result as RequestSlug[]).filter(r => r.from.user_id !== user.user_id))
        })

        setLoader(false)
    }

    useEffect(() => {
        getInvites()
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.headerContent}>
                <img src={REQUEST_ICON} />
                <h2>Friend Requests</h2>
            </div>
            <ul className={loader || invites === undefined || invites.length === 0 ? styles.listLoading : ''}>
                {
                    loader || invites === undefined ?
                    <div className={styles.listLoader}><Loading color='var(--color--text)' /></div> : 
                    (
                        invites.length === 0 ?
                        <p>No Requests</p> :
                        invites.filter(i => filterByCleared(i)).map(invite => {
                            return mapInviteToComponent(invite)
                        })
                    )
                }
            </ul>
        </div>
    )
}