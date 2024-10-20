'use client'

import { EMPIRE_DATA, EmpireData } from "@/app/server/empire"
import styles from "./empire.module.css"
import { MouseEvent, useState } from "react"

function EmpireCard({ empire, selectedEmpire, setSelectedEmpire } : { empire: EmpireData, selectedEmpire: number | undefined, setSelectedEmpire: (select: number) => void }) {

    function selectEmpire(event: MouseEvent<HTMLDivElement>) {
        event.preventDefault()
        setSelectedEmpire(empire.code)
    }

    return (
        <div onClick={selectEmpire} className={`${styles.card} ${(empire.code === selectedEmpire ? styles.highlightCard : '')}`}>
            <h2>{empire.name}</h2>
            <p>{empire.desc}</p>
            <div>
                <button hidden={empire.code !== selectedEmpire} disabled={empire.code !== selectedEmpire}>Continue</button>
            </div>
        </div>
    )
}

export default function Empire() {
    const [empire, setEmpire] = useState<number | undefined>()

    return (
        <>
            <h1 className={styles.title}>Pick Your Empire</h1>
            <div className={styles.page}>
                {
                    EMPIRE_DATA.map(e => {
                        return <EmpireCard empire={e} selectedEmpire={empire} setSelectedEmpire={setEmpire} />
                    })
                }
            </div>
        </>
    )
}