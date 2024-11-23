'use client'

import { BusinessEarningComponents, CongregationSlug, EmpireData, StateSlug } from "@/customs/utils/types"
import { COIN_ICON, STATE_ICON, STATE_OWNER_ICON } from "@/customs/utils/constants"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { CONGREGATION_TYPES } from "@/app/server/congregation"
import styles from "./css/stateOwnerView.module.css"
import { EMPIRE_DATA } from "@/app/server/empire"
import CollectionModal from "./CollectionModal"

function StateHeader({ earnings, tax } : { earnings: BusinessEarningComponents[], tax: number }) {
    const clockIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const [time, setTime] = useState<number>(0)

    function calculateCongregationEarnings(): number {
        let total: number = 0

        for (const earning of earnings) {
            total = total + (Number(earning.uncollectedEarnings) + (Number(earning.baseEarningRate) * (Number(earning.timeSinceLastUpdate) + time)))
        }

        return total
    }

    useEffect(() => {
        // Cleanup functions to clear the intervals
        const clearExistingClockInterval = () => {
            if (clockIntervalRef.current) {
                clearInterval(clockIntervalRef.current)
                clockIntervalRef.current = null
            }
        }
    
        clearExistingClockInterval()
    
        clockIntervalRef.current = setInterval(() => {
            setTime((prevTime) => {
                return prevTime + 1
            })
        }, 1000)
    
        // Cleanup intervals on component unmount or on effect re-run
        return () => clearExistingClockInterval()
    }, [earnings])

    return (
        <header className={styles.pageHeader}>
            <div className={styles.pageHeaderContent}>
                <img src={COIN_ICON} />
                <h1>{(calculateCongregationEarnings() * tax).toFixed(2)}</h1>
            </div>
        </header>
    )
}

function StateDetailsModule({ state, congregations, setVisible } : { state: StateSlug, congregations: CongregationSlug[], setVisible: (visible: boolean) => void }) {
    const [empireTypeData, setEmpireTypeData] = useState<EmpireData | undefined>(EMPIRE_DATA.find(e => e.code === Number(state.empire)))

    function showCollections(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setVisible(true)   
    }

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
                    <button className={styles.collectButton} onClick={showCollections}>View Collections</button>
                </div>
            </div>
        </div>
    )
}

export default function StateOwnerView({ state, congregations, earnings } : { state: StateSlug, congregations: CongregationSlug[], earnings: BusinessEarningComponents[] }) {
    const [modalVisible, setModalVisible] = useState<boolean>(false)

    return (
        <>
            <CollectionModal visible={modalVisible} setVisible={setModalVisible} stateId={state.state_id}  />
            <StateHeader earnings={earnings} tax={Number(state.state_tax_rate)} />
            <main className={styles.container}>
                <StateDetailsModule state={state} congregations={congregations} setVisible={setModalVisible} />
            </main>
        </>
    )
}