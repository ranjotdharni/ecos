'use client'

import { API_CONGREGATION_OWNER_ROUTE, CITY_ICON, CONGREGATION_ICON, STATE_ICON } from "@/customs/utils/constants"
import styles from "./newStatePage.module.css"
import { ChangeEvent, useEffect, useState } from "react"
import { CongregationSlug, CongregationType } from "@/customs/utils/types"
import useError from "@/customs/hooks/useError"
import { CONGREGATION_TYPES } from "@/app/server/congregation"
import Loading from "@/app/loading"

function CongregationSelectList({ throwError } : { throwError: (error: string) => void }) {
    const [loader, setLoader] = useState<boolean>(false)

    const [congregations, setCongregations] = useState<CongregationSlug[]>()
    const [stateFilter, setStateFilter] = useState<string>('')
    const [congregationFilter, setCongregationFilter] = useState<string>('')

    function filterState(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setStateFilter(event.target.value)
    }

    function filterCongregation(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setCongregationFilter(event.target.value)
    }

    async function getCongregations() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_CONGREGATION_OWNER_ROUTE}`).then(async response => {
            return await response.json()
        }).then(result => {
            if (result.error !== undefined)
                throwError(result.error)
            else
                setCongregations(result.congregations)
        })

        setLoader(false)
    }

    function CongregationSelectItem({ congregation } : { congregation: CongregationSlug }) {
        const [congregationType, setCongregationType] = useState<CongregationType | undefined>(CONGREGATION_TYPES.find(c => c.type === Number(congregation.congregation_status)))

        return (
            <li className={styles.csItem}>
                <div className={styles.csItemHeader}>
                    <img src={congregationType?.icon} />
                    <h2>{congregation.congregation_name}</h2>
                </div>
                <div className={styles.csItemBodyOne}>
                    <p>{congregation.state.state_name}</p>
                    <div className={styles.csItemButtons}>
                        <button>Select</button>
                    </div>
                </div>
                <div className={styles.csItemBodyTwo}>
                    <p>{`${congregation.state.state_owner_firstname} ${congregation.state.state_owner_lastname}`}</p>
                </div>
            </li>
        )
    }

    useEffect(() => {
        getCongregations()
    }, [])

    return (
        <div className={styles.csList}>
            <div className={styles.csHeader}>
                <img src={CONGREGATION_ICON} />
                <h1>Select Congregations</h1>
            </div>
            <div className={styles.csListFilters}>
                <input placeholder='Filter By State' onChange={filterState} />
                <input placeholder='Filter By Congregation' onChange={filterCongregation} />
            </div>
            <ul className={congregations === undefined || loader || congregations!.length === 0 ? '' : styles.ready}>
                {
                    congregations === undefined || loader ? 
                    <div className={styles.loader}><Loading color='var(--color--text)' /></div> :
                    (
                        congregations!.length === 0 ?
                        <p>You Own No Congregations</p> :
                        congregations!.map(congregation => {
                            return <CongregationSelectItem congregation={congregation} />
                        })
                    )
                }
            </ul>
        </div>
    )
}

function InviteSelectList() {

    return (
        <div className={styles.isList}>
            <div className={styles.isListFilters}>
                <input placeholder='Filter By State' />
                <input placeholder='Filter By Congregation' />
            </div>
            <ul>

            </ul>
        </div>
    )
}

export default function NewStatePage() {
    const [error, throwError] = useError()

    return (
        <main className={styles.container}>
            <div className={styles.error}>
                <p>{error}</p>
            </div>
            <div className={styles.nsHeaderContainer}>
                <div className={styles.nameInputWrapper}>
                    <label>State Name:</label>
                    <input placeholder='Enter State Name' />
                </div>
                <div className={styles.taxInputWrapper}>
                    <label>State Tax Rate:</label>
                    <input placeholder='Enter Tax Rate' />
                </div>
            </div>
            <div className={styles.nsContentContainer}>
                <CongregationSelectList throwError={throwError} />
                <InviteSelectList />
            </div>
        </main>
    )
}