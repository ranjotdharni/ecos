'use client'

import { BusinessSlug, BusinessType, GenericError } from "@/customs/utils/types"
import { API_BUSINESS_ROUTE, JOB_PAGE_ROUTE } from "@/customs/utils/constants"
import { MouseEvent, useContext, useEffect, useState } from "react"
import { UserContext } from "../../context/UserProvider"
import { BUSINESS_TYPES } from "@/app/server/business"
import { selectJob } from "@/customs/utils/actions"
import useError from "@/customs/hooks/useError"
import styles from "./businessList.module.css"
import { useRouter } from "next/navigation"
import Loading from "@/app/loading"

function BusinessItem({ business, throwError } : { business: BusinessSlug, throwError: (error: string) => void }) {
    const [businessTypeData, setBusinessTypeData] = useState<BusinessType | undefined>(BUSINESS_TYPES.find(b => b.type === business.business_type))
    const [loader, setLoader] = useState<boolean>(false)

    const router = useRouter()

    async function setJob(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        setLoader(true)

        await selectJob(business.business_id).then(result => {
            if ((result as GenericError).error)
                throwError((result as GenericError).message)
            else
                router.push(JOB_PAGE_ROUTE)
        })

        setLoader(false)
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
                    <p className={styles.itemState}>{business.congregation.state.state_name}</p>
                    <p className={business.congregation.congregation_status === 0 ? styles.itemSettlement : styles.itemCity}>{business.congregation.congregation_name}</p>
                    <button onClick={setJob}>
                        {
                            loader ?
                            <div style={{width: '40px', height: '50%'}}><Loading color='var(--color--text)' /></div> :
                            'Select'
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function BusinessList() {
    const { user } = useContext(UserContext)

    const [businesses, setBusinesses] = useState<BusinessSlug[]>([])
    const [loader, setLoader] = useState<boolean>(true)
    const [error, throwError] = useError()

    async function getBusinesses() {
        setLoader(true)

        const response = await fetch(`${window.location.origin}${API_BUSINESS_ROUTE}`, {
            method: 'POST',
            body: JSON.stringify({
                empire: user.empire
            })
        })

        const result = await response.json()
        setBusinesses(result.businesses)
        setLoader(false)
    }

    useEffect(() => {
        getBusinesses()
    }, [])

    return (
        <>
            <h1 className={styles.error}>{error}</h1>
            <ul className={styles.list}>
                {
                    businesses.length === 0 ?
                    <div className={styles.blank}>
                        {loader ? <div className={styles.loader}><Loading color='var(--color--subtext)' /></div> : <h1>No Results</h1>}
                    </div> :
                    businesses.map(business => {
                        return (
                            <BusinessItem key={business.business_id} business={business} throwError={throwError} />
                        )
                    })
                }
            </ul>
        </>
    )
}