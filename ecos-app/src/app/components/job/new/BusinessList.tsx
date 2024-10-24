'use client'

import { API_BUSINESS_EMPIRE_ROUTE } from "@/customs/utils/constants"
import { UserContext } from "../../context/UserProvider"
import { useContext, useEffect, useState } from "react"
import { BUSINESS_TYPES } from "@/app/server/business"
import { Business } from "@/customs/utils/types"
import styles from "./businessList.module.css"
import Loading from "@/app/loading"

function BusinessItem({ business } : { business: Business }) {
    return (
        <div className={styles.item}>
            <h2>{business.business_name}</h2>
            <p>{BUSINESS_TYPES.find(b => b.type === business.business_type)?.title}</p>
            <p>{business.base_earning_rate} / s</p>
            <p>{business.rank_earning_increase * 100}%</p>
            <p>{business.hiring === 1 ? 'Hiring' : 'Not Hiring'}</p>
        </div>
    )
}

export default function BusinessList() {
    const { user } = useContext(UserContext)

    const [businesses, setBusinesses] = useState<Business[]>([])

    async function getBusinesses() {
        const response = await fetch(`${window.location.origin}${API_BUSINESS_EMPIRE_ROUTE}`, {
            method: 'POST',
            body: JSON.stringify({
                empire: user.empire
            })
        })

        const result = await response.json()
        setBusinesses(result.businesses)
    }

    useEffect(() => {
        getBusinesses()
    }, [])

    return (
        <ul className={styles.list}>
            {
                businesses.length === 0 ?
                <Loading color='var(--color--text)' /> :
                businesses.map(business => {
                    return (
                        <BusinessItem key={business.business_id} business={business} />
                    )
                })
            }
        </ul>
    )
}