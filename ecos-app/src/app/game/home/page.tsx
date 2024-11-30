'use client'

import { BUSINESS_PAGE_ROUTE, CONGREGATION_ICON, CONGREGATION_PAGE_ROUTE, EMPIRE_PAGE_ROUTE, JOB_PAGE_ROUTE, STATE_ICON, STATE_PAGE_ROUTE } from "@/customs/utils/constants"
import { UserContext } from "@/app/components/context/UserProvider"
import { MouseEvent, useContext, useEffect, useState } from "react"
import RequestList from "@/app/components/home/RequestList"
import InviteList from "@/app/components/home/InviteList"
import { UserDetails } from "@/customs/utils/types"
import { fetchUser } from "@/customs/utils/tools"
import useError from "@/customs/hooks/useError"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"

const EMPIRE_INDEX: number = 0
const JOB_INDEX: number = 1
const BUSINESS_INDEX: number = 2
const CONGREGATION_INDEX: number = 3
const STATE_INDEX: number = 4

const LINKS: string[] = [
    EMPIRE_PAGE_ROUTE,    // empire page
    JOB_PAGE_ROUTE,    // job page
    BUSINESS_PAGE_ROUTE,    // business page
    CONGREGATION_PAGE_ROUTE,    // congregation page
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
            <div className={`${styles.middleContainer} ${styles.exemptContentItem} ${styles.empire} ${selectView === EMPIRE_INDEX ? styles.highlightCard : ''}`}>
                <InviteList throwError={throwError} />
            </div>

            <div className={`${styles.middleContainer} ${styles.exemptContentItem} ${styles.empire} ${selectView === EMPIRE_INDEX ? styles.highlightCard : ''}`}>
                <RequestList throwError={throwError} />
            </div>

            <div className={styles.middleContainer}>
                <div className={`${styles.contentItem} ${styles.congregations} ${selectView === CONGREGATION_INDEX ? styles.highlightCard : ''}`} onClick={confirmView(CONGREGATION_INDEX)}>
                    <img src={CONGREGATION_ICON} />
                    <h2>Your Congregations</h2>
                    <button onClick={confirmOrView(CONGREGATION_INDEX)} className={selectView === CONGREGATION_INDEX ? `${styles.visible} ${styles.viewButton}` : styles.viewButton}>View</button>
                </div>

                <div className={`${styles.contentItem} ${styles.states} ${selectView === STATE_INDEX ? styles.highlightCard : ''}`} onClick={confirmView(STATE_INDEX)}>
                    <img src={STATE_ICON} />
                    <h2>Your States</h2>
                    <button onClick={confirmOrView(STATE_INDEX)} className={selectView === STATE_INDEX ? `${styles.visible} ${styles.viewButton}` : styles.viewButton}>View</button>
                </div>
            </div>
        </section>
    )
}