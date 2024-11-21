'use client'

import { API_CONGREGATION_EARNINGS_ROUTE, COIN_ICON } from "@/customs/utils/constants"
import { BusinessEarningComponents } from "@/customs/utils/types"
import styles from "./css/congregationHeader.module.css"
import { useEffect, useRef, useState } from "react"
import Loading from "@/app/loading"

export default function CongregationHeader() {
    const [loader, setLoader] = useState<boolean>(false)
    const clockIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const [time, setTime] = useState<number>(0)

    const [earnings, setEarnings] = useState<BusinessEarningComponents[]>([])

    function calculateCongregationEarnings(): number {
        let total: number = 0

        for (const earning of earnings) {
            total = total + ((Number(earning.uncollectedEarnings) + (Number(earning.baseEarningRate) * (Number(earning.timeSinceLastUpdate) + time))) * Number(earning.ctr))
        }

        return total
    }

    async function getEarnings() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_CONGREGATION_EARNINGS_ROUTE}`).then(result => {
            return result.json()
        }).then(result => {
            if (result.error !== undefined) {
                console.log(result.message)
                return
            }

            setEarnings(result as BusinessEarningComponents[])
        })

        setLoader(false)
    }

    useEffect(() => {
        getEarnings()
    }, [])

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
        <header className={styles.container}>
            <img src={COIN_ICON} />
            {
                loader ? 
                <div className={styles.loaderWrapper}><div className={styles.loader}><Loading color='var(--color--text)' /></div></div> : 
                <h1>{calculateCongregationEarnings().toFixed(2)}</h1>
            }
        </header>
    )
}