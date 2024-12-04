'use client'

import { GenericError, ProfileType, UserDetails } from '@/customs/utils/types'
import { MouseEvent, useContext, useState } from 'react'
import { UserContext } from '../context/UserProvider'
import { PROFILE_DATA } from '@/app/server/profile'
import { editUser } from '@/customs/utils/actions'
import styles from './css/pfpModal.module.css'
import Loading from '@/app/loading'

export interface Confirm {
    title: string,
    message: string,
    question: string,
    callback: () => void
}

export default function PFPModal({ user, getUser, pfp, setPfp, visible, setVisible, throwError } : { user: UserDetails, getUser: () => void, pfp: ProfileType, setPfp: (pfp: ProfileType) => void, visible: boolean, setVisible: (visible: boolean) => void, throwError: (error: string) => void }) {
    const { getUser: getUserLocally } = useContext(UserContext)
    const [selected, setSelected] = useState<ProfileType>(pfp)
    const [loader, setLoader] = useState<boolean>(false)

    function selectPFP(code: number) {
        return (event: MouseEvent<HTMLDivElement>) => {
            event.preventDefault()
            const newPfp: ProfileType | undefined = PROFILE_DATA.find(p => p.code === code)
            if (newPfp !== undefined)
                setSelected(newPfp)
        }
    }

    function cancel(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setSelected(pfp)
        setVisible(false)
    }

    async function save(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (loader)
            return

        setLoader(true)

        await editUser(user.firstname, user.lastname, selected.code, user.bio).then(async result => {
            throwError(result.message)

            if ((result as GenericError).error !== undefined) {
                return
            }

            setPfp(selected)
            getUserLocally()
            await getUser()
        })

        setLoader(false)
    }

    return (
        <div className={styles.container} style={{display: (visible ? 'flex' : 'none')}}>
            <div className={styles.wrapper}>
                <div className={styles.titleWrapper}>
                    <h2>Edit Profile Picture</h2>
                </div>
                <div className={styles.messageWrapper}>
                    {
                        PROFILE_DATA.map(p => {
                            return (
                                <div className={`${styles.pfpIcon} ${p.code === selected.code ? styles.chosen : ''}`} onClick={selectPFP(p.code)}>
                                    <img src={p.icon} alt={p.title} />
                                    <p>{p.title}</p>
                                </div>
                            )
                        })
                    }
                </div>
                <div className={styles.questionWrapper}>
                    <p>Don't forget to save any changes!</p>
                    <div className={styles.buttonWrapper}>
                        <button onClick={cancel}>Cancel</button>
                        <button onClick={save}>{ loader ? <div className={styles.loader}><Loading color='var(--color--text)' /></div> : 'Save'}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}