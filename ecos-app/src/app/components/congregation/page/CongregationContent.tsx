'use client'

import { CongregationSlug, CongregationType } from "@/customs/utils/types"
import { API_CONGREGATION_OWNER_ROUTE } from "@/customs/utils/constants"
import { CONGREGATION_TYPES } from "@/app/server/congregation"
import styles from "./css/congregationContent.module.css"
import { MouseEvent, useEffect, useState } from "react"
import useError from "@/customs/hooks/useError"
import Loading from "@/app/loading"

function CongregationBusinessesList() {

    return (
        <div className={styles.businessesContainer}>
            Here are the businesses that are part of a selected congregation.
        </div>
    )
}

function CongregationList({ congregations, selected, select } : { congregations: CongregationSlug[] | undefined, selected: CongregationSlug | undefined, select: (choice: CongregationSlug) => void }) {
    
    function CongregationListItem({ c } : { c: CongregationSlug }) {
        const [type, setType] = useState<CongregationType>(CONGREGATION_TYPES.find(t => t.type === Number(c.congregation_status))!)

        function chooseCongregation(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault()
            select(c)
        }

        return (
            <li className={`${styles.cListItem} ${selected?.congregation_id === c.congregation_id ? styles.cSelected : ''}`} onClick={chooseCongregation}>
                <img src={type.icon} />
                <div className={styles.cListItemContent}>
                    <h3>{c.congregation_name}</h3>
                    <p>{c.state.state_name}</p>
                    <p>{`${c.state.state_owner_firstname} ${c.state.state_owner_lastname}`}</p>
                </div>
            </li>
        )
    }
    
    return (
        <div className={styles.congregationsContainer}>
            <h2>Your Congregations</h2>
            <ul className={`${congregations ? '' : styles.cLoading}`}>
                {
                    congregations ? 
                    congregations.map(congregation => {
                        return <CongregationListItem key={congregation.congregation_id} c={congregation} />
                    }) :
                    <div className={styles.cLoader}><Loading color='var(--color--text)' /></div>
                }
            </ul>
            <div className={styles.cFooter}>
                <button className={`${selected ? styles.cViewReady : ''}`}>View</button>
            </div>
        </div>
    )
}

export default function CongregationContent() {
    const [error, throwError] = useError()
    const [selected, select] = useState<CongregationSlug>()
    const [congregations, setCongregations] = useState<CongregationSlug[]>()

    async function getCongregations() {
        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_CONGREGATION_OWNER_ROUTE}`).then(async response => {
            return await response.json()
        }).then(result => {
            if (result.error !== undefined)
                throwError(result.error)
            else
                setCongregations(result.congregations)
        })
    }

    useEffect(() => {
        getCongregations()
    }, [])

    return (
        <main className={styles.container}>
            <CongregationList congregations={congregations} selected={selected} select={select} />
            <CongregationBusinessesList />
            <p className={styles.error}>{error}</p>
        </main>
    )
}