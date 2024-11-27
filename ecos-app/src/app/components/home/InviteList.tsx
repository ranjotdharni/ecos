'use client'

import { API_INVITE_ROUTE, INVITE_ICON, STATE_ICON } from "@/customs/utils/constants"
import { INVITE_ACCEPT_CODE, STATE_INVITE_CODE } from "@/app/server/invite"
import { acceptInvite, deleteInvite } from "@/customs/utils/actions"
import { MouseEvent, useContext, useEffect, useState } from "react"
import { GenericSuccess, StateInvite } from "@/customs/utils/types"
import { UserContext } from "../context/UserProvider"
import { dateToFormat } from "@/customs/utils/tools"
import styles from "./css/inviteList.module.css"
import Loading from "@/app/loading"

function StateInviteItem({ invite, clearInvite, throwError } : { invite: StateInvite, clearInvite: (clear: StateInvite) => void, throwError: (error: string) => void }): JSX.Element {
    const { setModal } = useContext(UserContext) 

    const [declineLoader, setDeclineLoader] = useState<boolean>(false)
    const [acceptLoader, setAcceptLoader] = useState<boolean>(false)

    async function declineInvite(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (declineLoader || acceptLoader)
            return

        async function decline() {
            setDeclineLoader(true)

            await deleteInvite(invite).then(result => {
                throwError(result.message)
                if ((result as GenericSuccess).success !== undefined) {
                    clearInvite(invite)
                }
            })

            setDeclineLoader(false)
        }

        setModal({
            title: 'Are You Sure?',
            message: `Invite declination cannot be reversed until the inviter re-sends another invite.`,
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

            await acceptInvite(invite).then(result => {
                throwError(result.message)
                if ((result as GenericSuccess).success !== undefined) {
                    clearInvite(invite)
                }
            })

            setAcceptLoader(false)
        }

        setModal({
            title: 'Are You Sure?',
            message: `Invite acceptance cannot be reversed and remains until the inviter either obliges your invite or chooses not to use it.`,
            question: 'Do you still want to continue?',
            callback: accept
        })
    }

    return (
        <li className={styles.inviteItem}>
            <div className={styles.inviteItemHeader}>
                <img src={STATE_ICON} />
                <h3>State Invite</h3>
            </div>
            <div className={styles.inviteItemBodyOne}>
                <p>{invite.from !== undefined ? invite.from.state_name : 'New State'}</p>
                <p>{invite.to.congregation_name}</p>
            </div>
            <div className={styles.inviteItemBodyTwo}>
                <p>{invite.user_from.username}</p>
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
    const [invites, setInvites] = useState<(StateInvite)[] | undefined>()
    const [cleared, setCleared] = useState<(StateInvite)[]>([])

    function filterByCleared(invite: StateInvite): boolean {
        if (Number(invite.type) === STATE_INVITE_CODE) {
            const compare: StateInvite = invite as StateInvite
            const searchCleared: StateInvite[] = cleared.filter(c => Number(c.type) === Number(invite.type))
            return searchCleared.find(
                c => 
                    c.user_from.id === compare.user_from.id &&
                    c.user_to.id === compare.user_to.id &&
                    c.to.congregation_id === compare.to.congregation_id
            ) === undefined
        }
        
        return true
    }

    function clearInviteLocally(clear: StateInvite) {
        const newCleared: (StateInvite)[] = [...cleared]
        newCleared.push(clear)
        setCleared(newCleared)
    }

    function mapInviteToComponent(invite: StateInvite): JSX.Element {
        if (Number(invite.type) === STATE_INVITE_CODE) {
            return <StateInviteItem invite={invite as StateInvite} clearInvite={clearInviteLocally} throwError={throwError} />
        }

        // EDIT THIS AS THIS FUNCTIONS GROWS!!!!!!!!!!
        return <StateInviteItem invite={invite as StateInvite} clearInvite={clearInviteLocally} throwError={throwError} />
    }

    async function getInvites() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_INVITE_ROUTE}`).then(result => {
            return result.json()
        }).then(result => {
            if (result.error !== undefined) {
                throwError(result.message)
            }

            setInvites(result)
        })

        setLoader(false)
    }

    useEffect(() => {
        getInvites()
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.headerContent}>
                <img src={INVITE_ICON} />
                <h2>Your Invites</h2>
            </div>
            <ul className={loader || invites === undefined || invites.length === 0 ? styles.listLoading : ''}>
                {
                    loader || invites === undefined ?
                    <div className={styles.listLoader}><Loading color='var(--color--text)' /></div> : 
                    (
                        invites.length === 0 ?
                        <p>No Invites</p> :
                        invites.filter(i => Number(i.accepted) !== INVITE_ACCEPT_CODE && filterByCleared(i)).map(invite => {
                            return mapInviteToComponent(invite)
                        })
                    )
                }
            </ul>
        </div>
    )
}