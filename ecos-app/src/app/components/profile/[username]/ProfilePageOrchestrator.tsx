'use client'

import { API_USER_ASSETS_ROUTE, BUSINESS_ICON, BUSINESS_PAGE_ROUTE, CONGREGATION_ICON, CONGREGATION_PAGE_ROUTE, STATE_ICON, STATE_PAGE_ROUTE } from "@/customs/utils/constants"
import { BusinessSlug, CongregationSlug, StateSlug, UserDetails } from "@/customs/utils/types"
import { CONGREGATION_TYPES } from "@/app/server/congregation"
import styles from "./css/profilePageOrchestrator.module.css"
import { ChangeEvent, useEffect, useState } from "react"
import { BUSINESS_TYPES } from "@/app/server/business"
import ProfileContent from "./ProfileContent"
import ProfileHeader from "./ProfileHeader"
import Loading from "@/app/loading"

function StateModule({ states } : { states: StateSlug[] }) {
    const [loader, setLoader] = useState<boolean>(false)

    const [stateFilter, setStateFilter] = useState<string>('')

    function onStateFilter(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setStateFilter(event.target.value)
    }

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

function CongregationModule({ congregations } : { congregations: CongregationSlug[] }) {
    const [loader, setLoader] = useState<boolean>(false)

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

function BusinessModule({ businesses } : { businesses: BusinessSlug[] }) {
    const [loader, setLoader] = useState<boolean>(false)

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

export default function ProfilePageOrchestrator({ user } : { user: UserDetails }) {
    const [loader, setLoader] = useState<boolean>(false)

    const [states, setStates] = useState<StateSlug[]>()
    const [congregations, setCongregations] = useState<CongregationSlug[]>()
    const [businesses, setBusinesses] = useState<BusinessSlug[]>()

    async function getComponentData() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_USER_ASSETS_ROUTE}`, {
            method: 'POST',
            body: JSON.stringify({
                username: user.username
            })
        }).then(result => {
            return result.json()
        }).then(result => {
            if (result.error !== undefined) {
                console.log(result.message)
                return
            }

            setStates(result.states)
            setCongregations(result.congregations)
            setBusinesses(result.businesses)
        })

        setLoader(false)
    }

    useEffect(() => {
        getComponentData()
    }, [])

    return (
        <div className={styles.main}>
            {
                loader || states === undefined || congregations === undefined || businesses === undefined ?
                <div className={styles.loader}><Loading color='var(--color--text)' /></div> :
                <>
                    <ProfileHeader user={user} />
                    <ProfileContent user={user} />
                    <div className={styles.listsContainer}>
                        <StateModule states={states} />
                        <CongregationModule congregations={congregations} />
                        <BusinessModule businesses={businesses} />
                    </div>
                </>
            }
        </div>
    )
}