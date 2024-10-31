'use client'

import { API_BUSINESS_ROUTE, BUSINESS_ICON, BUSINESS_PAGE_ROUTE, COIN_ICON, CONGREGATION_ICON, LABOR_SPLIT_ICON, STATE_ICON } from "@/customs/utils/constants"
import { BUSINESS_TYPES, NEW_BUSINESS_COST } from "@/app/server/business"
import { BusinessSlug, BusinessType } from "@/customs/utils/types"
import { MouseEvent, useEffect, useState } from "react"
import styles from "./css/businessContent.module.css"
import DropList from "../../app/DropList"
import Loading from "@/app/loading"

const test: SearchResult[] = [
    { 
        stateId: '1',
        congregationId: '1',
        state: 'State Name', 
        str: 0.025095, 
        congregation: 'Congregation Name', 
        ctr: 0.075365,
        ls: 0.004575
    },
    { 
        stateId: '1',
        congregationId: '2',
        state: 'State Name', 
        str: 0.025095, 
        congregation: 'Congregation Name', 
        ctr: 0.075365,
        ls: 0.004575
    },
    { 
        stateId: '1',
        congregationId: '3',
        state: 'State Name', 
        str: 0.025095, 
        congregation: 'Congregation Name', 
        ctr: 0.075365,
        ls: 0.004575 
    },
    { 
        stateId: '1',
        congregationId: '4',
        state: 'State Name', 
        str: 0.025095, 
        congregation: 'Congregation Name', 
        ctr: 0.075365,
        ls: 0.004575
    },
    { 
        stateId: '1',
        congregationId: '5',
        state: 'State Name', 
        str: 0.025095, 
        congregation: 'Congregation Name', 
        ctr: 0.075365,
        ls: 0.004575
    },
    { 
        stateId: '1',
        congregationId: '6',
        state: 'State Name', 
        str: 0.025095, 
        congregation: 'Congregation Name', 
        ctr: 0.075365,
        ls: 0.004575
    }
]

interface SearchResult { 
    stateId: string
    congregationId: string
    state: string 
    str: number 
    congregation: string 
    ctr: number 
    ls: number
}

function NewBusinessModule() {
    const [businessType, setBusinessType] = useState<number>(0)

    function selectBusinessType(selected: number): (event: MouseEvent<HTMLLIElement>) => void {
        return (event: MouseEvent<HTMLLIElement>) => {
            event.preventDefault()
            setBusinessType(selected)
        }
    }

    function dropListRender(item: BusinessType, selected?: number): JSX.Element | JSX.Element[] {
        return (
            <li key={`${item.title}_${Math.floor(Math.random() * 1000)}`} className={`${styles.dropListItem}${selected !== undefined ? ` ${styles.dropListItemHover}` : ``}`} onClick={selected !== undefined ? selectBusinessType(selected) : () => {}}>
                <img src={item.icon} />
                {item.title}
            </li>
        )
    }

    function SearchResult({ props } : { props: SearchResult }) {

        return (
            <li className={styles.searchResult}>
                <div className={styles.searchResultItem}>
                    <img src={STATE_ICON} />
                    <p>{`${props.state} (${(props.str * 100).toFixed(4)}%)`}</p>
                </div>
                <div className={styles.searchResultItem}>
                    <img src={CONGREGATION_ICON} />
                    <p>{`${props.congregation} (${(props.ctr * 100).toFixed(4)}%)`}</p>
                </div>
                <div className={styles.searchResultItem}>
                    <img src={LABOR_SPLIT_ICON} />
                    <p>{`${(props.ls * 100).toFixed(4)}%`}</p>
                </div>
                <button>Select</button>
            </li>
        )
    }

    return (
        <section className={styles.newBusinessModule}>
            <div className={styles.newHeaderContainer}>
                <img src={BUSINESS_ICON} />
                <h2>Start New Business</h2>
            </div>

            <div className={styles.newNameContainer}>
                <div>
                    <label>Name Your Business:</label>
                    <input placeholder='Enter Name' />
                </div>
                <div>
                    <label>Employee Rank Increase:</label>
                    <input />
                </div>
            </div>

            <div className={styles.newContentContainer}>
                <div className={styles.newContentSearch}>
                    <input className={styles.stateInput} placeholder='Search by State' />
                    <input className={styles.congregationInput} placeholder='Search by Congregation' />
                    <button className={styles.searchButton}>Search</button>
                </div>
                <ul className={styles.searchResults} >
                    {
                        test.map(result => {
                            return (
                                <SearchResult key={`${result.stateId}${result.congregationId}`} props={result} />
                            )
                        })
                    }
                </ul>
            </div>

            <div className={styles.newFooterContainer}>
                <div className={styles.dropListWrapper}>
                    <DropList<BusinessType> selected={businessType} data={BUSINESS_TYPES} render={dropListRender} topMargin='-625%' />
                </div>
                <button className={styles.submitButton}>
                    <img src={COIN_ICON} />
                    <p>{NEW_BUSINESS_COST}</p>
                </button>
            </div>
        </section>
    )
}

function BusinessListModule() {
    const [loader, setLoader] = useState<boolean>(false)

    const [businesses, setBusinesses] = useState<BusinessSlug[]>([])

    async function getBusinesses() {
        if (process.env.NEXT_PUBLIC_ENV === 'dev')
            return

        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_BUSINESS_ROUTE}`).then(async response => {
            return await response.json()
        }).then(response => {
            setBusinesses(response.businesses)
        })

        setLoader(false)
    }

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

    useEffect(() => {
        getBusinesses()
    }, [])

    return (
        <section className={styles.businessListModule}>
            <h2>Your Businesses</h2>
            <ul className={`${styles.businessList}${loader || businesses.length === 0 ? ` ${styles.listEmpty}` : ''}`}>
                {
                    loader ?
                    <div className={styles.businessListLoader}><Loading color='var(--color--subtext)' /></div> :
                    (
                        businesses.length === 0 ? 
                        <p style={{color: 'var(--color--subtext)', fontSize: 'smaller'}}>You Don't Own Any Businesses</p> : 
                        businesses.map(business => {
                            return <BusinessResult business={business} />
                        })
                    )
                }
            </ul>
        </section>
    )
}

export default function BusinessContent() {

    return (
        <div className={styles.page}>
            <NewBusinessModule />
            <BusinessListModule />
        </div>
    )
}