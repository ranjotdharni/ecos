'use client'

import { BusinessSlug, BusinessType } from "@/customs/utils/types"
import styles from "../css/basicView.module.css"
import { BUSINESS_OWNER_ICON, COIN_ICON } from "@/customs/utils/constants"
import { useState } from "react"
import { BUSINESS_TYPES } from "@/app/server/business"

function BusinessDetailsModule({ business } : { business: BusinessSlug }) {
    const [businessTypeData, setBusinessTypeData] = useState<BusinessType | undefined>(BUSINESS_TYPES.find(b => b.type === business.business_type))

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
                        <p className={styles.itemRank}>{(business.rank_earning_increase * 100).toFixed(6)}</p>
                        <p className={styles.itemSplit}>{(business.congregation.labor_split * 100).toFixed(4)}</p>
                        <p className={styles.itemWorker}>{business.worker_count}</p>
                    </div>
                </div>
                <div className={styles.itemRight}>
                    <div className={styles.earnings}>
                        <div>
                            <img src={BUSINESS_OWNER_ICON} />
                            <p>{`${business.business_owner_firstname} ${business.business_owner_lastname}`}</p>
                        </div>
                    </div>
                    <p className={styles.itemState}>{`${business.congregation.state.state_name} - ${(business.congregation.state.state_tax_rate * 100).toFixed(4)}`}</p>
                    <p className={business.congregation.congregation_status === 0 ? styles.itemSettlement : styles.itemCity}>{`${business.congregation.congregation_name} - ${(business.congregation.congregation_tax_rate * 100).toFixed(4)}`}</p>
                </div>
            </div>
        </div>
    )
}

export default function BasicView({ business } : { business: BusinessSlug }) {

    return (
        <div className={styles.container}>
            <BusinessDetailsModule business={business} />
        </div>
    )
}