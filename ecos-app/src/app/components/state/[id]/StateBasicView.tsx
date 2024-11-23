'use client'

import { CongregationSlug, EmpireData, StateSlug } from "@/customs/utils/types"
import { STATE_ICON, STATE_OWNER_ICON } from "@/customs/utils/constants"
import { CONGREGATION_TYPES } from "@/app/server/congregation"
import styles from "./css/stateBasicView.module.css"
import { EMPIRE_DATA } from "@/app/server/empire"
import { useState } from "react"

function StateDetailsModule({ state, congregations } : { state: StateSlug, congregations: CongregationSlug[] }) {
    const [empireTypeData, setEmpireTypeData] = useState<EmpireData | undefined>(EMPIRE_DATA.find(e => e.code === Number(state.empire)))

    return (
        <div className={styles.item}>
            <div className={styles.itemHeader}>
                <h2>{state.state_name}</h2>
                <img src={STATE_ICON} />
            </div>
            <div className={styles.itemContent}>
                <div className={styles.itemLeft}>
                    <p className={styles.itemType}>State</p>
                    <div className={styles.itemLeftContent}>
                        <p className={styles.itemSplit}>{empireTypeData?.name}</p>
                        <p className={styles.itemWorker}>{`Congregations (${congregations.length})`}</p>
                        <ul className={styles.businessList}>
                            {
                                congregations.map(congregation => {
                                    return (
                                        <li>
                                            <a href={`/game/congregation/${congregation.congregation_id}`}>
                                                <img src={CONGREGATION_TYPES.find(c => c.type === Number(congregation.congregation_status))?.icon} alt='Icon' />
                                                {congregation.congregation_name}
                                            </a>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div>
                <div className={styles.itemRight}>
                    <div className={styles.earnings}>
                        <div>
                            <img src={STATE_OWNER_ICON} />
                            <p>{`${state.state_owner_firstname} ${state.state_owner_lastname}`}</p>
                        </div>
                    </div>
                    <div className={styles.empire}>
                        <img src={EMPIRE_DATA.find(e => e.code === Number(state.empire))!.sigil.src} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function StateBasicView({ state, congregations } : { state: StateSlug, congregations: CongregationSlug[] }) {

    return (
        <main className={styles.container}>
            <StateDetailsModule state={state} congregations={congregations} />
        </main>
    )
}