'use client'

import { API_CONGREGATION_STATE_ROUTE, API_STATE_OWNER_ROUTE, CONGREGATION_NEW_PAGE_ROUTE, CONGREGATION_PAGE_ROUTE, STATE_ICON } from "@/customs/utils/constants"
import { CongregationSlug, CongregationType, StateSlug } from "@/customs/utils/types"
import { ChangeEvent, MouseEvent, useEffect, useState } from "react"
import { CONGREGATION_TYPES } from "@/app/server/congregation"
import styles from "./css/stateContent.module.css"
import useError from "@/customs/hooks/useError"
import Loading from "@/app/loading"

function StateCongregationsList({ state, throwError } : { state?: StateSlug, throwError: (error: string) => void }) {
    const [congregations, setCongregations] = useState<CongregationSlug[]>([])
    const [loader, setLoader] = useState<boolean>(false)

    function StateResult({ congregation } : { congregation: CongregationSlug }) {
        const [congregationType, setCongregationType] = useState<CongregationType | undefined>(CONGREGATION_TYPES.find(c => c.type === Number(congregation.congregation_status)))

        return (
            <li className={styles.businessListResult}>
                <a href={`${process.env.NEXT_PUBLIC_ORIGIN}${CONGREGATION_PAGE_ROUTE}/${congregation.congregation_id}`}>
                    <div className={styles.businessListResultName}>
                        <img src={congregationType?.icon} alt={`${congregation.congregation_status}`} />
                        <p>{congregation.congregation_name}</p>
                    </div>
                    <p className={styles.businessListResultState}>{congregation.state.state_name}</p>
                    <p className={styles.businessListResultCongregation}>{`${congregation.congregation_owner_firstname} ${congregation.congregation_owner_lastname}`}</p>
                </a>
            </li>
        )
    }

    async function getCongregations() {
        setLoader(true)

        await fetch(
            `${process.env.NEXT_PUBLIC_ORIGIN}${API_CONGREGATION_STATE_ROUTE}`, 
            { 
                method: 'POST', 
                body: JSON.stringify({ stateId: state?.state_id }) 
            }).then(async response => {

            return await response.json()
        }).then(result => {

            if (result.error !== undefined)
                throwError(result.error)
            else
                setCongregations(result)
        })

        setLoader(false)
    }

    useEffect(() => {
        if (state !== undefined)
            getCongregations()
    }, [state])

    return (
        <div className={styles.businessesContainer}>
            <h4>{`${state ? `${state.state_name} Congregations` : `No Selection`}`}</h4>
            <ul className={`${styles.businessList} ${loader ? styles.bLoading : ``}`}>
                {
                    loader ? 
                    <div className={styles.bLoader}><Loading color="var(--color--text)" /></div> : 
                    (
                        state ? 
                        congregations.map(congregation => <StateResult congregation={congregation} />) : 
                        <p className={styles.bSelectText}>Select a State</p>
                    )
                }
            </ul>
        </div>
    )
}

function StateList({ states, selected, select } : { states: StateSlug[] | undefined, selected: StateSlug | undefined, select: (choice: StateSlug | undefined) => void }) {
    const [stateFilter, setStateFilter] = useState<string>('')

    function filterState(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setStateFilter(event.target.value)
        select(undefined)
    }

    function StateListItem({ s } : { s: StateSlug }) {

        function chooseState(event: MouseEvent<HTMLLIElement>) {
            event.preventDefault()
            select(s)
        }

        return (
            <li className={`${styles.cListItem} ${selected?.state_id === s.state_id ? styles.cSelected : ''}`} onClick={chooseState}>
                <img src={STATE_ICON} />
                <div className={styles.cListItemContent}>
                    <h3>{s.state_name}</h3>
                    <p>{`${s.state_owner_firstname} ${s.state_owner_lastname}`}</p>
                    <p>{`${(Number(s.state_tax_rate) * 100).toFixed(4)}%`}</p>
                </div>
            </li>
        )
    }
    
    return (
        <div className={styles.congregationsContainer}>
            <div className={styles.cHeader}>
                <img src={STATE_ICON} />
                <h2>Your States</h2>
            </div>
            <div className={styles.cFilter}>
                <input onChange={filterState} placeholder='Filter By State' />
            </div>
            <ul className={`${states ? '' : styles.cLoading}`}>
                {
                    states ? 
                    states.filter(s => s.state_name.toLowerCase().includes(stateFilter.toLowerCase().trim())).map(state => {
                        return <StateListItem key={state.state_id} s={state} />
                    }) :
                    <div className={styles.cLoader}><Loading color='var(--color--text)' /></div>
                }
            </ul>
            <div className={styles.cFooter}>
                <a className={styles.newPageLink} href={`${CONGREGATION_NEW_PAGE_ROUTE}`}>New State</a>
                <a className={`${styles.viewCongregationLink} ${selected ? styles.cViewReady : ''}`} href={selected ? `/game/state/${selected.state_id}` : undefined}>{selected ? `View ${selected.state_name}` : 'Select a State'}</a>
            </div>
        </div>
    )
}

export default function StateContent() {
    const [error, throwError] = useError()
    const [selected, select] = useState<StateSlug>()
    const [states, setStates] = useState<StateSlug[]>()

    async function getStates() {
        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_STATE_OWNER_ROUTE}`).then(async response => {
            return await response.json()
        }).then(result => {
            if (result.error !== undefined)
                throwError(result.error)
            else
                setStates(result as StateSlug[])
        })
    }

    useEffect(() => {
        getStates()
    }, [])

    return (
        <main className={styles.container}>
            <StateList states={states} selected={selected} select={select} />
            <StateCongregationsList state={selected ? selected : undefined} throwError={throwError} />
            <p className={styles.error}>{error}</p>
        </main>
    )
}