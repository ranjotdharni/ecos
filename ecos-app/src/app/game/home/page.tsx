'use client'

import { BUSINESS_PAGE_ROUTE, EMPIRE_PAGE_ROUTE, JOB_PAGE_ROUTE, PROFILE_PAGE_ROUTE, STATE_PAGE_ROUTE } from "@/customs/utils/constants"
import { UserContext } from "@/app/components/context/UserProvider"
import { MouseEvent, useContext, useEffect, useState } from "react"
import RequestList from "@/app/components/home/RequestList"
import InviteList from "@/app/components/home/InviteList"
import { UserDetails } from "@/customs/utils/types"
import { PROFILE_DATA } from "@/app/server/profile"
import { EMPIRE_DATA } from "@/app/server/empire"
import { fetchUser } from "@/customs/utils/tools"
import useError from "@/customs/hooks/useError"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"

const EMPIRE_INDEX: number = 0
const JOB_INDEX: number = 1
const BUSINESS_INDEX: number = 2
const PROFILE_INDEX: number = 3
const STATE_INDEX: number = 4

const LINKS: string[] = [
    EMPIRE_PAGE_ROUTE,    // empire page
    JOB_PAGE_ROUTE,    // job page
    BUSINESS_PAGE_ROUTE,    // business page
    PROFILE_PAGE_ROUTE,    // profile page
    STATE_PAGE_ROUTE     // state page
]

export default function Home() {
    const { userTrigger } = useContext(UserContext)
    const [error, throwError] = useError()
    const router = useRouter()

    const [selectView, setView] = useState<number | undefined>()
    const [user, setUser] = useState<UserDetails>()

    function confirmView(choice: number) {
        return function (event: MouseEvent<HTMLDivElement>) {
            event.preventDefault()
            setView(choice)
        }
    }

    function confirmOrView(choice: number) {
        return function (event: MouseEvent<HTMLButtonElement>) {
            event.preventDefault()

            if (selectView !== choice)
                setView(choice)
            else
                router.push(LINKS[choice])
        }
    }

    async function getUser() {
        const u: UserDetails = await fetchUser()
        setUser(u)
    }

    useEffect(() => {
        getUser()
    }, [userTrigger])

    return (
        <section className={styles.page}>
            <p className={styles.error}>{error}</p>
            <div className={`${styles.middleContainer} ${styles.exemptContentItem} ${styles.empire}`}>
                <InviteList throwError={throwError} />
            </div>

            <div className={`${styles.middleContainer} ${styles.exemptContentItem} ${styles.empire}`}>
                <RequestList throwError={throwError} />
            </div>

            <div className={styles.middleContainer}>
                <div className={`${styles.contentItem} ${styles.congregations} ${selectView === PROFILE_INDEX ? styles.highlightCard : ''}`} onClick={confirmView(PROFILE_INDEX)}>
                    <img src={PROFILE_DATA.find(p => p.code === Number(user?.pfp))?.icon} />
                    <h2>Your Profile</h2>
                    <button onClick={confirmOrView(PROFILE_INDEX)} className={selectView === PROFILE_INDEX ? `${styles.visible} ${styles.viewButton}` : styles.viewButton}>View</button>
                </div>

                <div className={`${styles.contentItem} ${styles.states} ${selectView === EMPIRE_INDEX ? styles.highlightCard : ''}`} onClick={confirmView(EMPIRE_INDEX)}>
                    <img src={EMPIRE_DATA.find(e => e.code === Number(user?.empire))?.sigil.src} />
                    <h2>{EMPIRE_DATA.find(e => e.code === Number(user?.empire))?.name}</h2>
                    <button onClick={confirmOrView(EMPIRE_INDEX)} className={selectView === EMPIRE_INDEX ? `${styles.visible} ${styles.viewButton}` : styles.viewButton}>View</button>
                </div>
            </div>
        </section>
    )
}