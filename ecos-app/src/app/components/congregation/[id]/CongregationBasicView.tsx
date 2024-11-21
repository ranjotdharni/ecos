'use client'

import { BusinessSlug, CongregationSlug, CongregationType } from "@/customs/utils/types"
import { CONGREGATION_OWNER_ICON } from "@/customs/utils/constants"
import { CONGREGATION_TYPES } from "@/app/server/congregation"
import styles from "./css/congregationBasicView.module.css"
import { BUSINESS_TYPES } from "@/app/server/business"
import { useState } from "react"

function CongregationDetailsModule({ congregation, businesses } : { congregation: CongregationSlug, businesses: BusinessSlug[] }) {
    const [congregationTypeData, setBusinessTypeData] = useState<CongregationType | undefined>(CONGREGATION_TYPES.find(c => c.type === congregation.congregation_status))

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
                </div>
            </div>
        </div>
    )
}

export default function CongregationBasicView({ congregation, businesses } : { congregation: CongregationSlug, businesses: BusinessSlug[] }) {

    return (
        <main className={styles.container}>
            <CongregationDetailsModule congregation={congregation} businesses={businesses} />
        </main>
    )
}