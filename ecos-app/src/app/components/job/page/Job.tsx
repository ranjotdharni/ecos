'use client'

import { API_BUSINESS_ROUTE, API_WORKER_ROUTE, COIN_ICON, JOB_NEW_PAGE_ROUTE, MAX_CLOCK_TIME, MIN_CLOCK_REFRESH_TIME } from "@/customs/utils/constants"
import { BusinessSlug, BusinessType, WorkerSlug, Worker, GenericError, GenericSuccess } from "@/customs/utils/types"
import { calculateWage, timerString, timeSince } from "@/customs/utils/tools"
import { MouseEvent, useContext, useEffect, useRef, useState } from "react"
import { UserContext } from "../../context/UserProvider"
import { BUSINESS_TYPES } from "@/app/server/business"
import { clockInOut } from "@/customs/utils/actions"
import useError from "@/customs/hooks/useError"
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

function WorkModule({ worker, getJob, throwError } : { worker: WorkerSlug, getJob: () => Promise<void>, throwError: (error: string) => void }) {
    const { getUser } = useContext(UserContext)
    
    // Ref to hold the interval ID so it's always up-to-date
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const clockedIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const [businessTypeData, setBusinessTypeData] = useState<BusinessType | undefined>(BUSINESS_TYPES.find(b => b.type === worker.business.business_type))
    const [business, setBusiness] = useState<BusinessSlug>(worker.business)
    const [wage, setWage] = useState<number>(
        calculateWage(
            business.base_earning_rate, 
            business.rank_earning_increase, 
            business.worker_count, 
            worker.worker_rank, 
            business.congregation.labor_split
        )
    )

    const [started, setStarted] = useState<boolean>(
        worker.clocked_in !== null && 
        (
            worker.clocked_out === null || 
            new Date(worker.clocked_in) > new Date(worker.clocked_out)
        )
    )
    const [time, setTime] = useState<number>(
        started && worker.clocked_in !== null ?     // if worker already clocked in,
        timeSince(new Date(worker.clocked_in)) :    // then time = time since clock in (in seconds)
        0                                           // otherwise 0 seconds since clock in
    )
    const [timer, setTimer] = useState<string>(
        worker.clocked_in !== null && (worker.clocked_out === null || new Date(worker.clocked_in) > new Date(worker.clocked_out)) ? // if worker clocked in,
        timerString(time) : // then timer string = time since clock in (in seconds)
        (   // otherwise, if waiting for clock in refresh delay
            worker.clocked_in !== null && worker.clocked_out !== null && (new Date(worker.clocked_out) > new Date(worker.clocked_in)) && (MIN_CLOCK_REFRESH_TIME - timeSince(new Date(worker.clocked_out!)) > 0) ? 
            timerString(MIN_CLOCK_REFRESH_TIME - timeSince(new Date(worker.clocked_out!))) : // then timer string = time remaining until clock in refreshes
            'Ready to Clock In' // otherwise, timer string = clock in ready indication
        )
    )

    function clockIn() {
        if (!started)
            setStarted(true)    // timer for clock in time is started
    }

    async function clockOut() {
        if (started)
            setStarted(false)   // timer for clock in time is stopped
        setTime(0)  // reset the time variable
        getUser()   // trigger user detail refetch so gold value in client refreshes to show updates
        await getJob()  // refetch job details to get updated clock out time, component will then re-update and show values accordingly
    }

    async function clock(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        
        if (started) {
            const result: GenericSuccess | GenericError = await clockInOut()
            if ((result as GenericError).error) {
                throwError(result.message)
                return
            }
            clockOut()

        }
        else {
            const result: GenericSuccess | GenericError = await clockInOut()
            if ((result as GenericError).error) {
                throwError(result.message)
                return
            }
            clockIn()
        }
    }

    useEffect(() => {
    
        // Cleanup functions to clear the intervals
        const clearExistingClockedInterval = () => {
            if (clockedIntervalRef.current) {
                clearInterval(clockedIntervalRef.current)
                clockedIntervalRef.current = null
            }
        }

        const clearExistingRefreshInterval = () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current)
                refreshIntervalRef.current = null
            }
        }

        const clearAllIntervals = () => {
            clearExistingClockedInterval()
            clearExistingRefreshInterval()
        }
    
        if (started) {  // clocked in
            // Clear any existing interval before setting a new one
            clearAllIntervals()

            clockedIntervalRef.current = setInterval(() => {
                setTime((prevTime) => {
                    const newTime = prevTime + 1
                    setTimer(timerString(newTime))
                    return newTime
                })
            }, 1000)
        }
        else if (   // waiting for refresh time until next clock in available
            worker.clocked_in !== null &&
            worker.clocked_out !== null &&
            new Date(worker.clocked_out) > new Date(worker.clocked_in) &&
            MIN_CLOCK_REFRESH_TIME - timeSince(new Date(worker.clocked_out!)) > 0
        ) {
            // Clear any existing interval before setting a new one
            clearAllIntervals()
            
            refreshIntervalRef.current = setInterval(() => {
                if (MIN_CLOCK_REFRESH_TIME - timeSince(new Date(worker.clocked_out!)) < 1) {    // refresh time is up, clear interval
                    clearExistingRefreshInterval()
                    setTimer('Ready to Clock In')
                } else {
                    setTimer(timerString(MIN_CLOCK_REFRESH_TIME - timeSince(new Date(worker.clocked_out!))))    // otherwise update timer with remaining time
                }
            }, 1000);
        } else if (!started) {  // clock in is ready, THIS MUST COME LAST
            setTimer('Ready to Clock In')
            clearAllIntervals()
        }
    
        // Cleanup intervals on component unmount or on effect re-run
        return () => clearAllIntervals()
    }, [time, started, worker.clocked_in, worker.clocked_out, MIN_CLOCK_REFRESH_TIME])

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
                        <div className={styles.timer}>
                            <p className={started ? styles.tickUp : (timer !== 'Ready to Clock In' ? styles.tickDown : '')}>{timer}</p>
                        </div>
                    </div>
                </div>
                <div className={styles.itemRight}>
                    <div className={styles.earnings}>
                        <div>
                            <p>{(Math.min(wage * time, wage * MAX_CLOCK_TIME)).toFixed(2)}</p>
                            <img src={COIN_ICON} />
                        </div>
                    </div>
                    <p className={styles.itemState}>{business.congregation.state.state_name}</p>
                    <p className={business.congregation.congregation_status === 0 ? styles.itemSettlement : styles.itemCity}>{business.congregation.congregation_name}</p>
                    <button onClick={clock}>
                        { started ? 'Clock Out' : 'Clock In' }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function JobModule() {
    const [error, throwError] = useError()
    const [loader, setLoader] = useState<boolean>(true)
    const [worker, setWorker] = useState<WorkerSlug | undefined | void>()

    async function getJob() {
        setLoader(true) // set loader

        // fetch user's job
        const worker: WorkerSlug | void = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_WORKER_ROUTE}`).then(async response => {

            return await response.json()

        }).then(async (response) => {
            if (response.empty) // user has no job
                return

            const worker: Worker = response.worker

            return await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_BUSINESS_ROUTE}`, {     // fetch business data of user's job
                method: 'POST',
                body: JSON.stringify({
                    businessId: worker.business_id
                })
            }).then(async response => {

                return await response.json()

            }).then(response => {

                const business: BusinessSlug = response.businesses[0]

                return {
                    worker_id: worker.worker_id,
                    business: business,
                    firstname: worker.worker_first_name,
                    lastname: worker.worker_last_name,
                    worker_rank: worker.worker_rank,
                    clocked_in: worker.clocked_in,
                    clocked_out: worker.clocked_out
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
                    <WorkModule worker={worker} getJob={getJob} throwError={throwError} /> :
                    <NoJobModule /> // if no job, show no job module
                )
            }
            <p className={styles.error}>{error}</p>
        </div>
    )
}