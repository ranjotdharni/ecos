'use client'

import { FriendSlug, GenericError, GenericSuccess, RequestSlug, UserDetails } from "@/customs/utils/types"
import { sendFriendRequest, undoFriends } from "@/customs/utils/actions"
import { ChangeEvent, MouseEvent, useContext, useState } from "react"
import { UserContext } from "../../context/UserProvider"
import styles from "./css/profileContent.module.css"
import useError from "@/customs/hooks/useError"
import Loading from "@/app/loading"

export default function ProfileContent({ user, friend, setFriend, request, setRequest } : { user: UserDetails, friend?: FriendSlug, setFriend: (friend?: FriendSlug) => void, request?: RequestSlug, setRequest: (request?: RequestSlug) => void }) {
    const { getUser } = useContext(UserContext)
    const [loader, setLoader] = useState<boolean>(false)
    const [error, throwError] = useError()

    const [first, setFirst] = useState<string>(user.firstname)
    const [last, setLast] = useState<string>(user.lastname)
    const [bio, setBio] = useState<string>(user.bio)

    function editFirst(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()

        if (event.target.value.length > 32)
            return

        setFirst(event.target.value)
    }

    function editLast(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()

        if (event.target.value.length > 32)
            return

        setLast(event.target.value)
    }

    function editBio(event: ChangeEvent<HTMLTextAreaElement>) {
        event.preventDefault()

        if (event.target.value.length > 128)
            return

        setBio(event.target.value)
    }

    async function save(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (loader || request !== undefined)
            return

        setLoader(true)

        if (friend !== undefined) {
            await undoFriends(user.user_id).then(result => {
                throwError(result.message)

                if ((result as GenericSuccess).success !== undefined) {
                    setFriend()
                }
            })
        }
        else {
            await sendFriendRequest(user.username).then(result => {
                if ((result as GenericError).error !== undefined) {
                    throwError((result as GenericError).message)
                    return
                }
                throwError('Friend Request Sent')
                setRequest(result as RequestSlug)
            })
        }

        setLoader(false)
    }

    return (
        <main className={styles.main}>
            <p className={styles.error}>{error}</p>
            {
                loader || user === undefined || first === undefined || last === undefined || bio === undefined ? 
                <div className={styles.loader}><Loading color='var(--color--text)' /></div> :
                <>
                    <div className={styles.mainEditsInputs}>
                        <p>{`${first} ${last}`}</p>
                        <button onClick={save}>
                            {
                                friend !== undefined ?
                                'Unfriend' :
                                (request !== undefined ? 'Pending' : 'Add Friend')
                            }
                        </button>
                    </div>
                    <p className={styles.mainEditsBio}>
                        {bio}
                    </p>
                </>
            }
        </main>
    )
}