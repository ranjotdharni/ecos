'use client'

import { BusinessEarningComponents, BusinessSlug, BusinessType, GenericError, GenericSuccess, WorkerSlug } from "@/customs/utils/types"
import { API_BUSINESS_EARNINGS_ROUTE, BUSINESS_OWNER_ICON, COIN_ICON } from "@/customs/utils/constants"
import { MouseEvent, MouseEventHandler, useContext, useEffect, useRef, useState } from "react"
import { collectBusinessEarnings } from "@/customs/utils/actions"
import { calculateTotalSplit } from "@/customs/utils/tools"
import { UserContext } from "../../context/UserProvider"
import { BUSINESS_TYPES } from "@/app/server/business"
import styles from "../css/ownerView.module.css"
import useError from "@/customs/hooks/useError"
import CollectionModal from "./CollectionModal"
import WorkerModal from "./WorkerModal"
import Loading from "@/app/loading"

function BusinessHeader({ business, totalSplit, collectLoader, setWorkerModalVisible, setCollectionModalVisible, throwError } : { business: BusinessSlug, totalSplit: number, collectLoader: boolean, setWorkerModalVisible: (visible: boolean) => void, setCollectionModalVisible: (visible: boolean) => void, throwError: (error: string) => void }) {
    const clockIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const [earningData, setEarningData] = useState<BusinessEarningComponents>()
    const [time, setTime] = useState<number>(0)

    function showWorkers(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        setWorkerModalVisible(true)
    }

    function showCollections(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        setCollectionModalVisible(true)
    }

    async function getEarnings() {

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_BUSINESS_EARNINGS_ROUTE}`, {
            method: 'POST',
            body: JSON.stringify({
                businessId: business.business_id
            })
        }).then(response => {
            return response.json()
        }).then(result => {
            if (result.error !== undefined) {
                throwError((result as GenericError).message)
            }
            else {
                const earnings: BusinessEarningComponents = result

                setEarningData(earnings)
                setTime(Number(earnings.timeSinceLastUpdate))
            }
        })
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
    }, [earningData])

    useEffect(() => {
        getEarnings()
    }, [collectLoader])

    return (
        <div className={styles.headerContainer}>
            {
                collectLoader ? 
                <div style={{height: '50%', marginLeft: '10%', aspectRatio: 1}}><Loading color='var(--color--text)' /></div> : 
                <div className={styles.headerContent}>
                    <img src={COIN_ICON} />
                    <h1>{earningData === undefined ? '---' : (Number(earningData.uncollectedEarnings) + ((1 - business.congregation.congregation_tax_rate - business.congregation.state.state_tax_rate - totalSplit) * earningData.baseEarningRate * time)).toFixed(2)}</h1>
                </div>
            }
            <div className={styles.headerButtons}>
                <button className={styles.workerButton} onClick={showWorkers} >Edit Workers</button>
                <button className={styles.workerButton} onClick={showCollections} >View Collections</button>
            </div>
        </div>
    )
}

function BusinessDetailsModule({ business, collectLoader, setCollectLoader, throwError } : { business: BusinessSlug, collectLoader: boolean, setCollectLoader: (setting: boolean) => void, throwError: (error: string) => void }) {
    const { getUser } = useContext(UserContext)
    
    const [businessTypeData, setBusinessTypeData] = useState<BusinessType | undefined>(BUSINESS_TYPES.find(b => b.type === business.business_type))

    async function collect(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        setCollectLoader(true)

        await collectBusinessEarnings(business.business_id).then(result => {
            throwError(result.message)

            if ((result as GenericSuccess).success)
                getUser()
        })

        setCollectLoader(false)
    }

    return (
        <div className={styles.item}>
            <div className={styles.itemHeader}>
                <h2>{business.business_name}</h2>
                <img src={businessTypeData?.icon} />
            </div>
            <div className={styles.itemContent}>
                <div className={styles.itemLeft}>
                    <p className={styles.itemType}>{businessTypeData?.title}</p>
                    <div className={styles.itemLeftContent}>
                        <p className={styles.itemEarning}>{(business.base_earning_rate * 1).toFixed(4)}</p>
                        <p className={styles.itemRank}>{(business.rank_earning_increase * 100).toFixed(6)}</p>
                        <p className={styles.itemSplit}>{(business.congregation.labor_split * 100).toFixed(4)}</p>
                        <p className={styles.itemWorker}>{business.worker_count}</p>
                    </div>
                </div>
                <div className={styles.itemRight}>
                    <div className={styles.earnings}>
                        <div>
                            <p>{`${business.business_owner_firstname} ${business.business_owner_lastname}`}</p>
                            <img src={BUSINESS_OWNER_ICON} />
                        </div>
                    </div>
                    <p className={styles.itemState}>{`${business.congregation.state.state_name} - ${(business.congregation.state.state_tax_rate * 100).toFixed(4)}`}</p>
                    <p className={business.congregation.congregation_status === 0 ? styles.itemSettlement : styles.itemCity}>{`${business.congregation.congregation_name} - ${(business.congregation.congregation_tax_rate * 100).toFixed(4)}`}</p>
                    <button onClick={collect}>
                        {
                            collectLoader ? 
                            <div style={{height: '50%', marginLeft: '10%', aspectRatio: 1}}><Loading color='var(--color--text)' /></div> : 
                            'Collect'
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function OwnerView({ business, workers } : { business: BusinessSlug, workers: WorkerSlug[] }) {
    const [error, throwError] = useError()
    const [collectLoader, setCollectLoader] = useState<boolean>(false)
    const [workerModalVisible, setWorkerModalVisible] = useState<boolean>(false)
    const [collectionModalVisible, setCollectionModalVisible] = useState<boolean>(false)

    return (
        <>
            <WorkerModal businessId={business.business_id} workers={workers} visible={workerModalVisible} setVisible={setWorkerModalVisible} throwError={throwError} />
            <CollectionModal visible={collectionModalVisible} setVisible={setCollectionModalVisible} throwError={throwError} businessId={business.business_id} />
            <div className={styles.container}>
                <BusinessHeader business={business} totalSplit={calculateTotalSplit(workers)} collectLoader={collectLoader} setWorkerModalVisible={setWorkerModalVisible} setCollectionModalVisible={setCollectionModalVisible} throwError={throwError} />
                <BusinessDetailsModule business={business} collectLoader={collectLoader} setCollectLoader={setCollectLoader} throwError={throwError} />
            </div>
            <p className={styles.error}>{error}</p>
        </>
    )
}