'use client'

import { API_BUSINESS_EMPIRE_ROUTE, API_CONGREGATION_ROUTE, API_STATE_ROUTE, BUSINESS_ICON, BUSINESS_PAGE_ROUTE, CONGREGATION_ICON, CONGREGATION_PAGE_ROUTE, STATE_ICON, STATE_PAGE_ROUTE } from "@/customs/utils/constants"
import { BusinessSlug, CongregationSlug, EmpireData, StateSlug } from "@/customs/utils/types"
import { CONGREGATION_TYPES } from "@/app/server/congregation"
import { ChangeEvent, useEffect, useState } from "react"
import { BUSINESS_TYPES } from "@/app/server/business"
import styles from "./css/empireContent.module.css"
import { EMPIRE_DATA } from "@/app/server/empire"
import { fetchUser } from "@/customs/utils/tools"
import Loading from "@/app/loading"

function StateModule({ empire } : { empire: EmpireData }) {
    const [loader, setLoader] = useState<boolean>(false)
    const [states, setStates] = useState<StateSlug[]>([])

    const [stateFilter, setStateFilter] = useState<string>('')

    function onStateFilter(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setStateFilter(event.target.value)
    }

    async function getStates() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_STATE_ROUTE}`).then(result => {
            return result.json()
        }).then(result => {
            if (result.error !== undefined) {
                console.log(result.message)
                return
            }

            setStates(result)
        })

        setLoader(false)
    }

    useEffect(() => {
        getStates()
    }, [])

    return (
        <div className={styles.contentModule}>
            <div className={styles.contentHeader}>
                <img src={STATE_ICON} />
                <h2>States</h2>
            </div>
            <div className={styles.contentInputs}>
                <input onChange={onStateFilter} placeholder='Filter By State' />
            </div>
            <ul className={styles.contentList}>
                {
                    loader ? 
                    <div className={styles.loader}><Loading color='var(--color--text)' /></div> : 
                    states.filter(
                        i => 
                            i.state_name.toLowerCase().includes(stateFilter.trim().toLowerCase())
                    ).map(state => {
                        return (
                            <li>
                                <a className={styles.stateItem} href={`${STATE_PAGE_ROUTE}/${state.state_id}`}>
                                    <h3>{state.state_name}</h3>
                                    <p>{`${state.state_owner_firstname} ${state.state_owner_lastname}`}</p>
                                </a>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}

function CongregationModule({ empire } : { empire: EmpireData }) {
    const [loader, setLoader] = useState<boolean>(false)
    const [congregations, setCongregations] = useState<CongregationSlug[]>([])

    const [stateFilter, setStateFilter] = useState<string>('')
    const [congregationFilter, setCongregationFilter] = useState<string>('')

    function onStateFilter(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setStateFilter(event.target.value)
    }

    function onCongregationFilter(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setCongregationFilter(event.target.value)
    }

    async function getCongregations() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_CONGREGATION_ROUTE}`).then(result => {
            return result.json()
        }).then(result => {
            if (result.error !== undefined) {
                console.log(result.message)
                return
            }

            setCongregations(result.congregations)
        })

        setLoader(false)
    }

    useEffect(() => {
        getCongregations()
    }, [])

    return (
        <div className={styles.contentModule}>
            <div className={styles.contentHeader}>
                <img src={CONGREGATION_ICON} />
                <h2>Congregations</h2>
            </div>
            <div className={styles.contentInputs}>
                <input onChange={onStateFilter} placeholder='Filter By State' />
                <input onChange={onCongregationFilter} placeholder='Filter By Congregation' />
            </div>
            <ul className={styles.contentList}>
                {
                    loader ? 
                    <div className={styles.loader}><Loading color='var(--color--text)' /></div> : 
                    congregations.filter(
                        i => 
                            i.state.state_name.toLowerCase().includes(stateFilter.trim().toLowerCase()) &&
                            i.congregation_name.toLowerCase().includes(congregationFilter.trim().toLowerCase())
                    ).map(congregation => {
                        return (
                            <li>
                                <a className={styles.congregationItem} href={`${CONGREGATION_PAGE_ROUTE}/${congregation.congregation_id}`}>
                                    <div>
                                        <img src={CONGREGATION_TYPES.find(c => c.type === Number(congregation.congregation_status))?.icon} />
                                        <h3>{congregation.congregation_name}</h3>
                                    </div>
                                    <p>{`${congregation.congregation_owner_firstname} ${congregation.congregation_owner_lastname}`}</p>
                                </a>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}

function BusinessModule({ empire } : { empire: EmpireData }) {
    const [loader, setLoader] = useState<boolean>(false)
    const [businesses, setBusinesses] = useState<BusinessSlug[]>([])

    const [stateFilter, setStateFilter] = useState<string>('')
    const [congregationFilter, setCongregationFilter] = useState<string>('')
    const [businessFilter, setBusinessFilter] = useState<string>('')

    function onStateFilter(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setStateFilter(event.target.value)
    }

    function onCongregationFilter(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setCongregationFilter(event.target.value)
    }

    function onBusinessFilter(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setBusinessFilter(event.target.value)
    }

    async function getBusinesses() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_BUSINESS_EMPIRE_ROUTE}`).then(result => {
            return result.json()
        }).then(result => {
            if (result.error !== undefined) {
                console.log(result.message)
                return
            }

            setBusinesses(result)
        })

        setLoader(false)
    }

    useEffect(() => {
        getBusinesses()
    }, [])

    return (
        <div className={styles.contentModule}>
            <div className={styles.contentHeader}>
                <img src={BUSINESS_ICON} />
                <h2>Businesses</h2>
            </div>
            <div className={styles.contentInputs}>
                <input onChange={onStateFilter} placeholder='Filter By State' />
                <input onChange={onCongregationFilter} placeholder='Filter By Congregation' />
                <input onChange={onBusinessFilter} placeholder='Filter By Business' />
            </div>
            <ul className={styles.contentList}>
                {
                    loader ? 
                    <div className={styles.loader}><Loading color='var(--color--text)' /></div> : 
                    businesses.filter(
                        i => 
                            i.congregation.state.state_name.toLowerCase().includes(stateFilter.trim().toLowerCase()) &&
                            i.congregation.congregation_name.toLowerCase().includes(congregationFilter.trim().toLowerCase()) &&
                            i.business_name.toLowerCase().includes(businessFilter.trim().toLowerCase())
                    ).map(business => {
                        return (
                            <li>
                                <a className={styles.businessItem} href={`${BUSINESS_PAGE_ROUTE}/${business.business_id}`}>
                                    <div>
                                        <img src={BUSINESS_TYPES.find(b => b.type === Number(business.business_type))?.icon} />
                                        <h3>{business.business_name}</h3>
                                    </div>
                                    <p>{`${business.business_owner_firstname} ${business.business_owner_lastname}`}</p>
                                </a>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}

export default function EmpireContent() {
    const [loader, setLoader] = useState<boolean>(false)

    const [empire, setEmpire] = useState<EmpireData>()

    async function getEmpire() {
        setLoader(true)

        await fetchUser().then(user => {
            setEmpire(EMPIRE_DATA.find(e => e.code === Number(user.empire))!)
        })

        setLoader(false)
    }

    useEffect(() => {
        getEmpire()
    }, [])
    
    return (
        <main className={styles.container}>
            {
                loader || empire === undefined ? 
                <div className={styles.loader}><Loading color='var(--color--text)' /></div> : 
                <>
                    <StateModule empire={empire} />
                    <CongregationModule empire={empire} />
                    <BusinessModule empire={empire} />
                </>
            }
        </main>
    )
}