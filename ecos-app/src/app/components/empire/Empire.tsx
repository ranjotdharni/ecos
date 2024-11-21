'use client'

import { selectEmpire } from "@/customs/utils/actions"
import { EmpireData } from "@/customs/utils/types"
import { EMPIRE_DATA } from "@/app/server/empire"
import { MouseEvent, useState } from "react"
import styles from "./css/empire.module.css"

interface EmpireCardProps { 
    empire: EmpireData 
    selectedEmpire: number | undefined 
    setSelectedEmpire: (select: number) => void 
    pickEmpire: (choice: number) => void
}

function EmpireCard(props : EmpireCardProps) {

    function selectEmpire(event: MouseEvent<HTMLDivElement>) {
        event.preventDefault()
        props.setSelectedEmpire(props.empire.code)
    }

    async function makeChoice(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        await props.pickEmpire(props.empire.code)
    }

    return (
        <div onClick={selectEmpire} className={`${styles.card} ${(props.empire.code === props.selectedEmpire ? styles.highlightCard : '')}`}>
            <img src={props.empire.sigil.src} />
            <h2>{props.empire.name}</h2>
            <p>{props.empire.desc}</p>
            <div>
                <button onClick={makeChoice} hidden={props.empire.code !== props.selectedEmpire} disabled={props.empire.code !== props.selectedEmpire}>Select</button>
            </div>
        </div>
    )
}

export default function Empire({ urlParams } : { urlParams: { [key: string]: string | string[] | undefined } }) {
    const [empire, setEmpire] = useState<number | undefined>()

    async function pickEmpire(empire: number) {
        await selectEmpire(empire, urlParams).then(error => {
            if (error)
                console.log(error)
        })
    }

    return (
        <>
            <h1 className={styles.title}>Choose Your Empire</h1>
            <div className={styles.page}>
                {
                    EMPIRE_DATA.map(e => {
                        return <EmpireCard empire={e} selectedEmpire={empire} setSelectedEmpire={setEmpire} pickEmpire={pickEmpire} />
                    })
                }
            </div>
        </>
    )
}