'use client'

import { API_BUSINESS_EARNINGS_ROUTE, API_BUSINESS_EARNINGS_TOTAL_ROUTE, COIN_ICON } from "@/customs/utils/constants"
import { BusinessEarningComponents, BusinessSlug, GenericError, WorkerSlug } from "@/customs/utils/types"
import { calculateTotalSplit } from "@/customs/utils/tools"
import styles from "./css/businessHeader.module.css"
import { useEffect, useRef, useState } from "react"
import Loading from "@/app/loading"

export default function BusinessHeader() {
    const clockIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const [loader, setLoader] = useState<boolean>(false)

    const [props, setProps] = useState<{ business: BusinessSlug, workers: WorkerSlug[] }[]>()
    const [earningData, setEarningData] = useState<BusinessEarningComponents[]>()
    const [totalUncollectedEarnings, setTotalUncollectedEarnings] = useState<number>(0)

    const [time, setTime] = useState<number>(0)

    function calculateUncollectedEarnings(uncollected: number[]): number {
        let currentUncollectedEarnings: number = 0

        for (const value of uncollected) {
            currentUncollectedEarnings = currentUncollectedEarnings + value
        }

        return currentUncollectedEarnings
    }

    function calculateEarnings(): number {
        if (earningData !== undefined && earningData.length !== 0) {
            let currentEarnings: number = 0

            for (const item of earningData) {
                const businessProp: { business: BusinessSlug, workers: WorkerSlug[] } | undefined = props?.find(p => p.business.business_id === item.businessId)

                if (businessProp === undefined) {
                    console.log('Fatal Earnings Calculation Error')
                    return 0
                }

                currentEarnings = currentEarnings + (Number(item.uncollectedEarnings) + ((1 - businessProp.business.congregation.congregation_tax_rate - businessProp.business.congregation.state.state_tax_rate - calculateTotalSplit(businessProp.workers)) * item.baseEarningRate * (item.timeSinceLastUpdate + time)))
            }

            return totalUncollectedEarnings + currentEarnings
        }

        return 0
    }

    async function getEarnings() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_BUSINESS_EARNINGS_TOTAL_ROUTE}`).then(response => {
            return response.json()
        }).then(result => {
            if (result.error !== undefined) {
                console.log((result as GenericError).message)
            }
            else {
                setProps(result as { business: BusinessSlug, workers: WorkerSlug[] }[])
            }
        })

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_BUSINESS_EARNINGS_ROUTE}`).then(response => {
            return response.json()
        }).then(result => {
            if (result.error !== undefined) {
                console.log((result as GenericError).message)
            }
            else {
                const earnings: BusinessEarningComponents[] = result

                setEarningData(earnings)
                setTotalUncollectedEarnings(calculateUncollectedEarnings(earnings.map(e => e.uncollectedEarnings)))
            }
        })

        setLoader(false)
    }

    useEffect(() => {
        // Cleanup functions to clear the intervals
        const clearExistingClockInterval = () => {
            if (clockIntervalRef.current) {
                clearInterval(clockIntervalRef.current)
                clockIntervalRef.current = null
            }
        }
    
        if (earningData) {
            clearExistingClockInterval()
    
            clockIntervalRef.current = setInterval(() => {
                setTime((prevTime) => {
                    return prevTime + 1
                })
            }, 1000)
        }
    
        // Cleanup intervals on component unmount or on effect re-run
        return () => clearExistingClockInterval()
    }, [earningData])

    useEffect(() => {
        getEarnings()
    }, [])

    return (
        <div className={styles.container}>
            <img src={COIN_ICON} />
            {
                loader || props === undefined || earningData === undefined ? 
                <div className={styles.loaderWrapper}><div className={styles.loader}><Loading color='var(--color--text)' /></div></div> : 
                <h1>{earningData === undefined ? '---' : calculateEarnings().toFixed(2)}</h1>
            }
        </div>
    )
}