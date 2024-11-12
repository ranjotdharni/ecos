'use client'

import { API_BUSINESS_EARNINGS_ROUTE, AUTH_ROUTE, BUSINESS_OWNER_ICON, COIN_ICON } from "@/customs/utils/constants"
import { BusinessEarnings, BusinessSlug, BusinessType, GenericSuccess, WorkerSlug } from "@/customs/utils/types"
import { MouseEvent, useContext, useEffect, useRef, useState } from "react"
import { calculateEarningRate, timeSince } from "@/customs/utils/tools"
import { collectBusinessEarnings } from "@/customs/utils/actions"
import { UserContext } from "../../context/UserProvider"
import { BUSINESS_TYPES } from "@/app/server/business"
import styles from "../css/ownerView.module.css"
import useError from "@/customs/hooks/useError"
import { useRouter } from "next/navigation"
import WorkerModal from "./WorkerModal"
import Loading from "@/app/loading"

function BusinessHeader({ businessId, earningRate, collectLoader, setWorkerModalVisible } : { businessId: string, earningRate: number, collectLoader: boolean, setWorkerModalVisible: (visible: boolean) => void }) {
    const router = useRouter()
    const clockIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const [earnings, setEarnings] = useState<BusinessEarnings>()
    const [time, setTime] = useState<number>(0)

    function showWorkers(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        setWorkerModalVisible(true)
    }

    async function getEarnings() {

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_BUSINESS_EARNINGS_ROUTE}`).then(response => {
            return response.json()
        }).then(result => {
            if (result.earnings === undefined) {
                router.push(AUTH_ROUTE)
            }
            else {
                const allEarnings: BusinessEarnings[] = result.earnings 
                const earnings: BusinessEarnings | undefined = allEarnings.find(e => e.business_id === businessId)

                if (earnings === undefined) {
                    router.push(AUTH_ROUTE)
                }
                else {
                    setEarnings(earnings)
                    setTime(timeSince(new Date(earnings.last_update)))
                }
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
    }, [earningRate, earnings])

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
                    <h1>{earnings === undefined ? '---' : (Number(earnings.last_earning) + (earningRate * time)).toFixed(2)}</h1>
                </div>
            }
            <button className={styles.workerButton} onClick={showWorkers}>Edit Workers</button>
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

    const [earningRate, setEarningRate] = useState<number>(calculateEarningRate(business, workers))

    return (
        <>
            <WorkerModal businessId={business.business_id} workers={workers} visible={workerModalVisible} setVisible={setWorkerModalVisible} throwError={throwError} />
            <div className={styles.container}>
                <BusinessHeader businessId={business.business_id} earningRate={earningRate} collectLoader={collectLoader} setWorkerModalVisible={setWorkerModalVisible} />
                <BusinessDetailsModule business={business} collectLoader={collectLoader} setCollectLoader={setCollectLoader} throwError={throwError} />
            </div>
            <p className={styles.error}>{error}</p>
        </>
    )
}