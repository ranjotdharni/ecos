'use client'

import { BusinessEarningComponents, BusinessSlug, CongregationSlug, CongregationType } from "@/customs/utils/types"
import { COIN_ICON, CONGREGATION_OWNER_ICON } from "@/customs/utils/constants"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { CONGREGATION_TYPES } from "@/app/server/congregation"
import styles from "./css/congregationOwnerView.module.css"
import { BUSINESS_TYPES } from "@/app/server/business"
import CollectionModal from "./CollectionModal"

function CongregationHeader({ earnings, tax } : { earnings: BusinessEarningComponents[], tax: number }) {
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

function CongregationDetailsModule({ congregation, businesses, setVisible } : { congregation: CongregationSlug, businesses: BusinessSlug[], setVisible: (visible: boolean) => void }) {
    const [congregationTypeData, setBusinessTypeData] = useState<CongregationType | undefined>(CONGREGATION_TYPES.find(c => c.type === congregation.congregation_status))

    function showCollections(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setVisible(true)   
    }

    return (
        <div className={styles.item}>
            <div className={styles.itemHeader}>
                <h2>{congregation.congregation_name}</h2>
                <img src={congregationTypeData?.icon} />
            </div>
            <div className={styles.itemContent}>
                <div className={styles.itemLeft}>
                    <p className={styles.itemType}>{congregationTypeData?.title}</p>
                    <div className={styles.itemLeftContent}>
                        <p className={styles.itemRank}>{(congregation.congregation_tax_rate * 100).toFixed(4)}</p>
                        <p className={styles.itemSplit}>{(congregation.labor_split * 100).toFixed(4)}</p>
                        <p className={styles.itemWorker}>{`Businesses (${businesses.length})`}</p>
                        <ul className={styles.businessList}>
                            {
                                businesses.map(business => {
                                    return (
                                        <li>
                                            <a href={`/game/business/${business.business_id}`}>
                                                <img src={BUSINESS_TYPES.find(b => b.type === business.business_type)?.icon} alt='Icon' />
                                                {business.business_name}
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
                            <img src={CONGREGATION_OWNER_ICON} />
                            <p>{`${congregation.congregation_owner_firstname} ${congregation.congregation_owner_lastname}`}</p>
                        </div>
                    </div>
                    <p className={styles.itemState}>{`${congregation.state.state_name} - ${(congregation.state.state_tax_rate * 100).toFixed(4)}`}</p>
                    <button className={styles.collectButton} onClick={showCollections}>View Collections</button>
                </div>
            </div>
        </div>
    )
}

export default function CongregationOwnerView({ congregation, businesses, earnings } : { congregation: CongregationSlug, businesses: BusinessSlug[], earnings: BusinessEarningComponents[] }) {
    const [modalVisible, setModalVisible] = useState<boolean>(false)

    return (
        <>
            <CollectionModal visible={modalVisible} setVisible={setModalVisible} congregationId={congregation.congregation_id}  />
            <CongregationHeader earnings={earnings} tax={Number(congregation.congregation_tax_rate)} />
            <main className={styles.container}>
                <CongregationDetailsModule congregation={congregation} businesses={businesses} setVisible={setModalVisible} />
            </main>
        </>
    )
}