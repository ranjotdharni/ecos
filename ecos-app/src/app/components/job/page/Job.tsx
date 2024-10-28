'use client'

import { API_BUSINESS_ROUTE, API_WORKER_ROUTE, COIN_ICON, JOB_NEW_PAGE_ROUTE } from "@/customs/utils/constants"
import { BusinessSlug, BusinessType, WorkerSlug, Worker } from "@/customs/utils/types"
import { MouseEvent, useContext, useEffect, useState } from "react"
import { UserContext } from "../../context/UserProvider"
import { GameContext } from "../../context/GameProvider"
import { BUSINESS_TYPES } from "@/app/server/business"
import { calculateWage } from "@/customs/utils/tools"
import styles from "./job.module.css"
import Loading from "@/app/loading"

function NoJobModule() {
    return (
        <div className={styles.noJob}>
            <h1>You have no job.</h1>
            <a href={JOB_NEW_PAGE_ROUTE}>Find a Job</a>
        </div>
    )
}

function WorkModule({ worker } : { worker: WorkerSlug }) {
    const { time, started, startTimer, stopTimer } = useContext(GameContext)

    const [businessTypeData, setBusinessTypeData] = useState<BusinessType | undefined>(BUSINESS_TYPES.find(b => b.type === worker.business.business_type))
    const [business, setBusiness] = useState<BusinessSlug>(worker.business)
    const [wage, setWage] = useState<number>(calculateWage(business.base_earning_rate, business.rank_earning_increase, business.worker_count, worker.worker_rank, business.congregation.labor_split))

    function clockIn(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        
        if (started)
            stopTimer()
        else
            startTimer()
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
                        <p className={styles.itemEarning}>{(business.base_earning_rate * 1).toFixed(2)}</p>
                        <p className={styles.itemRank}>{(business.rank_earning_increase * 100).toFixed(2)}</p>
                        <p className={styles.itemSplit}>{(business.congregation.labor_split * 100).toFixed(2)}</p>
                        <p className={styles.itemWorker}>{business.worker_count}</p>
                    </div>
                </div>
                <div className={styles.itemRight}>
                    <div className={styles.earnings}>
                        <div>
                            <p>{(wage * time).toFixed(2)}</p>
                            <img src={COIN_ICON} />
                        </div>
                    </div>
                    <p className={styles.itemState}>{business.congregation.state.state_name}</p>
                    <p className={business.congregation.congregation_status === 0 ? styles.itemSettlement : styles.itemCity}>{business.congregation.congregation_name}</p>
                    <button onClick={clockIn}>
                        { started ? 'Clock Out' : 'Clock In' }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function JobModule() {
    const { user } = useContext(UserContext)

    const [loader, setLoader] = useState<boolean>(true)
    const [worker, setWorker] = useState<WorkerSlug | undefined | void>()

    async function getJob() {
        setLoader(true)

        const worker: WorkerSlug | void = await fetch(`${window.location.origin}${API_WORKER_ROUTE}`, {   // fetch user's job
            method: 'POST',
            body: JSON.stringify({
                username: user.username
            })
        }).then(async response => {
            return await response.json()
        }).then(async (response) => {
            if (response.empty) // user has no job
                return

            const worker: Worker = response.worker

            return await fetch(`${window.location.origin}${API_BUSINESS_ROUTE}`, {     // fetch business data of user's job
                method: 'POST',
                body: JSON.stringify({
                    businessId: worker.business_id
                })
            }).then(async response => {

                return response.json()

            }).then(response => {

                const business: BusinessSlug = response.businesses[0]

                return {
                    worker_id: worker.worker_id,
                    business: business,
                    worker_rank: worker.worker_rank
                }

            })

        })

        setWorker(worker)  
        setLoader(false)    // unset loader
    }

    useEffect(() => {
        getJob()
    }, [])

    return (
        <div className={styles.container}>
            {
                loader ?    // if loader, show loader
                <div className={styles.loader}><Loading color='var(--color--text)' /></div> :
                (
                    worker ?    // if user has job, show work module
                    <WorkModule worker={worker} /> :
                    <NoJobModule /> // if no job show, show no job module
                )
            }
        </div>
    )
}