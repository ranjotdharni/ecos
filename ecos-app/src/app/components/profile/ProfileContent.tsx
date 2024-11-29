'use client'

import { ChangeEvent, MouseEvent, useContext, useState } from "react"
import { GenericError, UserDetails } from "@/customs/utils/types"
import { UserContext } from "../context/UserProvider"
import styles from "./css/profileContent.module.css"
import { editUser } from "@/customs/utils/actions"
import useError from "@/customs/hooks/useError"
import Loading from "@/app/loading"

export default function ProfileContent({ user } : { user: UserDetails }) {
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

        if (loader)
            return

        setLoader(true)

        await editUser(first.trim(), last.trim(), Number(user.pfp), bio.trim()).then(result => {
            throwError(result.message)

            if ((result as GenericError).error !== undefined) {
                return
            }

            getUser()
        })

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
                        <input placeholder="Enter First Name" value={first} onChange={editFirst} />
                        <input placeholder="Enter Last Name" value={last} onChange={editLast} />
                        <button onClick={save}>Save</button>
                    </div>
                    <textarea className={styles.mainEditsBio} placeholder='Enter Bio...' value={bio} onChange={editBio}>

                    </textarea>
                </>
            }
        </main>
    )
}