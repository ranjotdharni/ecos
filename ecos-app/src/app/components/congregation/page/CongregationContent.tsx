'use client'

import { API_BUSINESS_CONGREGATION_ROUTE, API_CONGREGATION_OWNER_ROUTE, BUSINESS_PAGE_ROUTE, CONGREGATION_ICON, CONGREGATION_NEW_PAGE_ROUTE } from "@/customs/utils/constants"
import { BusinessSlug, BusinessType, CongregationSlug, CongregationType } from "@/customs/utils/types"
import { ChangeEvent, MouseEvent, useEffect, useState } from "react"
import { CONGREGATION_TYPES } from "@/app/server/congregation"
import styles from "./css/congregationContent.module.css"
import { BUSINESS_TYPES } from "@/app/server/business"
import useError from "@/customs/hooks/useError"
import Loading from "@/app/loading"

function CongregationBusinessesList({ congregation, throwError } : { congregation?: CongregationSlug, throwError: (error: string) => void }) {
    const [businesses, setBusinesses] = useState<BusinessSlug[]>([])
    const [loader, setLoader] = useState<boolean>(false)

    function BusinessResult({ business } : { business: BusinessSlug }) {
        const [businessType, setBusinessType] = useState<BusinessType | undefined>(BUSINESS_TYPES.find(b => b.type === business.business_type))

        return (
            <li className={styles.businessListResult}>
                <a href={`${process.env.NEXT_PUBLIC_ORIGIN}${BUSINESS_PAGE_ROUTE}/${business.business_id}`}>
                    <div className={styles.businessListResultName}>
                        <img src={businessType?.icon} alt={`${business.business_type}`} />
                        <p>{business.business_name}</p>
                    </div>
                    <p className={styles.businessListResultState}>{business.congregation.state.state_name}</p>
                    <p className={styles.businessListResultCongregation}>{business.congregation.congregation_name}</p>
                </a>
            </li>
        )
    }

    async function getBusinesses() {
        setLoader(true)

        await fetch(
            `${process.env.NEXT_PUBLIC_ORIGIN}${API_BUSINESS_CONGREGATION_ROUTE}`, 
            { 
                method: 'POST', 
                body: JSON.stringify({ congregationId: congregation?.congregation_id }) 
            }).then(async response => {

            return await response.json()
        }).then(result => {

            if (result.error !== undefined)
                throwError(result.error)
            else
                setBusinesses(result.businesses)
        })

        setLoader(false)
    }

    useEffect(() => {
        if (congregation !== undefined)
            getBusinesses()
    }, [congregation])

    return (
        <div className={styles.businessesContainer}>
            <h4>{`${congregation ? `${congregation.congregation_name} Businesses` : `No Selection`}`}</h4>
            <ul className={`${styles.businessList} ${loader ? styles.bLoading : ``}`}>
                {
                    loader ? 
                    <div className={styles.bLoader}><Loading color="var(--color--text)" /></div> : 
                    (
                        congregation ? 
                        businesses.map(business => <BusinessResult business={business} />) : 
                        <p className={styles.bSelectText}>Select a Congregation</p>
                    )
                }
            </ul>
        </div>
    )
}

function CongregationList({ congregations, selected, select } : { congregations: CongregationSlug[] | undefined, selected: CongregationSlug | undefined, select: (choice: CongregationSlug | undefined) => void }) {
    const [stateFilter, setStateFilter] = useState<string>('')
    const [congregationFilter, setCongregationFilter] = useState<string>('')

    function filterState(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setStateFilter(event.target.value)
        select(undefined)
    }

    function filterCongregation(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setCongregationFilter(event.target.value)
        select(undefined)
    }

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
            <div className={styles.cHeader}>
                <img src={CONGREGATION_ICON} />
                <h2>Your Congregations</h2>
            </div>
            <div className={styles.cFilter}>
                <input onChange={filterState} placeholder='Filter By State' />
                <input onChange={filterCongregation} placeholder='Filter By Congregation' />
            </div>
            <ul className={`${congregations ? '' : styles.cLoading}`}>
                {
                    congregations ? 
                    congregations.filter(c => c.state.state_name.toLowerCase().includes(stateFilter.toLowerCase().trim()) && c.congregation_name.toLowerCase().includes(congregationFilter.toLowerCase().trim())).map(congregation => {
                        return <CongregationListItem key={congregation.congregation_id} c={congregation} />
                    }) :
                    <div className={styles.cLoader}><Loading color='var(--color--text)' /></div>
                }
            </ul>
            <div className={styles.cFooter}>
                <a className={styles.newPageLink} href={`${CONGREGATION_NEW_PAGE_ROUTE}`}>New Congregation</a>
                <a className={`${styles.viewCongregationLink} ${selected ? styles.cViewReady : ''}`} href={selected ? `/game/congregation/${selected.congregation_id}` : undefined}>{selected ? `View ${selected.congregation_name}` : 'Select a Congregation'}</a>
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
            <CongregationBusinessesList congregation={selected ? selected : undefined} throwError={throwError} />
            <p className={styles.error}>{error}</p>
        </main>
    )
}