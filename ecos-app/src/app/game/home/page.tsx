'use client'

import { MouseEvent, useContext, useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"
import { UserContext } from "@/app/components/context/UserProvider"
import { EMPIRE_DATA } from "@/app/server/empire"

const EMPIRE_INDEX: number = 0
const JOB_INDEX: number = 1
const BUSINESS_INDEX: number = 2
const CONGREGATION_INDEX: number = 3
const STATE_INDEX: number = 4

const LINKS: string[] = [
    '/game/empire',    // empire page
    '/game/job',    // job page
    '/game/business',    // business page
    '/game/congregation',    // congregation page
    '/game/state'     // state page
]

export default function Home() {
    const { user } = useContext(UserContext)
    const router = useRouter()

    const [selectView, setView] = useState<number | undefined>()

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

    return (
        <section className={styles.page}>
            <div className={`${styles.empire} ${selectView === EMPIRE_INDEX ? styles.highlightCard : ''}`} onClick={confirmView(EMPIRE_INDEX)}>
                <img src={EMPIRE_DATA.find(empire => empire.code === user.empire)?.sigil.src} alt='Sigil' />
                <h2>Your Empire</h2>
                <button onClick={confirmOrView(EMPIRE_INDEX)} className={selectView === EMPIRE_INDEX ? styles.visible : ''}>View</button>
            </div>

            <div className={`${styles.job} ${selectView === JOB_INDEX ? styles.highlightCard : ''}`} onClick={confirmView(JOB_INDEX)}>
                <img src='https://img.icons8.com/color/96/parse-from-clipboard.png' />
                <h2>Your Job</h2>
                <button onClick={confirmOrView(JOB_INDEX)} className={selectView === JOB_INDEX ? styles.visible : ''}>View</button>
            </div>

            <div className={`${styles.businesses} ${selectView === BUSINESS_INDEX ? styles.highlightCard : ''}`} onClick={confirmView(BUSINESS_INDEX)}>
                <img src='https://img.icons8.com/color/96/money-bag.png' />
                <h2>Your Businesses</h2>
                <button onClick={confirmOrView(BUSINESS_INDEX)} className={selectView === BUSINESS_INDEX ? styles.visible : ''}>View</button>
            </div>

            <div className={`${styles.congregations} ${selectView === CONGREGATION_INDEX ? styles.highlightCard : ''}`} onClick={confirmView(CONGREGATION_INDEX)}>
                <img src='https://img.icons8.com/color/96/castle.png' />
                <h2>Your Congregations</h2>
                <button onClick={confirmOrView(CONGREGATION_INDEX)} className={selectView === CONGREGATION_INDEX ? styles.visible : ''}>View</button>
            </div>

            <div className={`${styles.states} ${selectView === STATE_INDEX ? styles.highlightCard : ''}`} onClick={confirmView(STATE_INDEX)}>
                <img src='https://img.icons8.com/color/96/israeli-parliament.png' />
                <h2>Your States</h2>
                <button onClick={confirmOrView(STATE_INDEX)} className={selectView === STATE_INDEX ? styles.visible : ''}>View</button>
            </div>
        </section>
    )
}