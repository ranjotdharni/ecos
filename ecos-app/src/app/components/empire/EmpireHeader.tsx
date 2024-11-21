'use client'

import { EmpireData } from "@/customs/utils/types"
import styles from "./css/empireHeader.module.css"
import { fetchUser } from "@/customs/utils/tools"
import { EMPIRE_DATA } from "@/app/server/empire"
import { useEffect, useState } from "react"
import Loading from "@/app/loading"


export default function EmpireHeader() {
    const [loader, setLoader] = useState<boolean>(false)

    const [empire, setEmpire] = useState<EmpireData>()

    async function getEmpire() {
        setLoader(true)

        await fetchUser().then(user => {
            setEmpire(EMPIRE_DATA.find(e => e.code === Number(user.empire))!)
        })

        setLoader(false)
    }

    useEffect(() => {
        getEmpire()
    }, [])

    return (
        <header className={styles.container}>
            {
                loader ? 
                <div className={styles.loader}><Loading color='var(--color--text)' /></div> : 
                <>
                    <div className={styles.title}>
                        <img src={empire?.sigil.src} />
                        <h1>{empire?.name}</h1>
                    </div>
                    <div className={styles.description}>
                        <p>{empire?.desc}</p>
                    </div>
                </>
            }
        </header>
    )
}