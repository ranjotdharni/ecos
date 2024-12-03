'use client'

import { API_BUSINESS_ROUTE, API_CONGREGATION_ROUTE, BUSINESS_ICON, BUSINESS_PAGE_ROUTE, COIN_ICON, CONGREGATION_ICON, LABOR_SPLIT_ICON, STATE_ICON } from "@/customs/utils/constants"
import { BusinessSlug, BusinessType, CongregationSlug, GenericError, GenericSuccess } from "@/customs/utils/types"
import { ChangeEvent, MouseEvent, useContext, useEffect, useState } from "react"
import { BUSINESS_TYPES, NEW_BUSINESS_COST } from "@/app/server/business"
import { purchaseBusiness } from "@/customs/utils/actions"
import { UserContext } from "../../context/UserProvider"
import styles from "./css/businessContent.module.css"
import useError from "@/customs/hooks/useError"
import { useRouter } from "next/navigation"
import DropList from "../../app/DropList"
import Loading from "@/app/loading"

function NewBusinessModule({ throwError, refetchBusinesses, refetchGold } : { throwError: (error: string) => void, refetchBusinesses: () => void, refetchGold: () => void }) {
    const router = useRouter()
    const [searchLoader, setSearchLoader] = useState<boolean>(false)
    const [purchaseLoader, setPurchaseLoader] = useState<boolean>(false)

    const [businessType, setBusinessType] = useState<number>(0)
    const [congregations, setCongregations] = useState<CongregationSlug[]>([])
    const [chosenCongregation, setChosenCongregation] = useState<CongregationSlug | undefined>()

    const [name, setName] = useState<string>('')
    const [rank, setRank] = useState<string>('')
    const [state, setState] = useState<string>('')
    const [congregation, setCongregation] = useState<string>('')

    async function getCongregations() {
        if (process.env.NEXT_PUBLIC_ENV === 'dev')
            return

        setSearchLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_CONGREGATION_ROUTE}`).then(async response => {
            return await response.json()
        }).then(response => {
            setCongregations(response.congregations)
        })

        setSearchLoader(false)
    }

    function changeName(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setName(event.target.value)
    }

    function changeRank(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setRank(event.target.value)
    }

    function changeState(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setChosenCongregation(undefined)
        setState(event.target.value)
    }

    function changeCongregation(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setChosenCongregation(undefined)
        setCongregation(event.target.value)
    }

    function selectBusinessType(selected: number): (event: MouseEvent<HTMLLIElement>) => void {
        return (event: MouseEvent<HTMLLIElement>) => {
            event.preventDefault()
            setBusinessType(selected)
        }
    }

    async function submit(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (purchaseLoader)
            return

        if (name.trim() === '' || rank.trim() === '' || chosenCongregation === undefined) {
            throwError('Please Fill All Required Fields')
            return
        }

        setPurchaseLoader(true)

        await purchaseBusiness(name.trim(), rank.trim(), BUSINESS_TYPES[businessType], chosenCongregation).then(result => {
            if ((result as GenericError).error !== undefined) {
                throwError(result.message)
                return
            }

            refetchBusinesses()
            refetchGold()
            router.push(`${BUSINESS_PAGE_ROUTE}/${(result as GenericSuccess).message}`)
        })

        setPurchaseLoader(false)
    }

    function dropListRender(item: BusinessType, selected?: number): JSX.Element | JSX.Element[] {
        return (
            <li key={`${item.title}_${Math.floor(Math.random() * 1000)}`} className={`${styles.dropListItem}${selected !== undefined ? ` ${styles.dropListItemHover}` : ``}`} onClick={selected !== undefined ? selectBusinessType(selected) : () => {}}>
                <img src={item.icon} />
                {item.title}
            </li>
        )
    }

    function SearchResult({ congregation, selected, passUp } : { congregation: CongregationSlug, selected: boolean, passUp: (congregation: CongregationSlug) => void }) {

        function onClick(event: MouseEvent<HTMLButtonElement>) {
            event.preventDefault()
            passUp(congregation)
        }

        return (
            <li className={styles.searchResult}>
                <div className={styles.searchResultItem}>
                    <img src={STATE_ICON} />
                    <p>{`${congregation.state.state_name} (${(congregation.state.state_tax_rate * 100).toFixed(4)}%)`}</p>
                </div>
                <div className={styles.searchResultItem}>
                    <img src={CONGREGATION_ICON} />
                    <p>{`${congregation.congregation_name} (${(congregation.congregation_tax_rate * 100).toFixed(4)}%)`}</p>
                </div>
                <div className={styles.searchResultItem}>
                    <img src={LABOR_SPLIT_ICON} />
                    <p>{`${(congregation.labor_split * 100).toFixed(4)}%`}</p>
                </div>
                <button className={selected ? styles.highlightButton : ''} onClick={onClick}>{selected ? 'Selected' : 'Select'}</button>
            </li>
        )
    }

    useEffect(() => {
        getCongregations()
    }, [])

    return (
        <form className={styles.newBusinessModule}>
            <div className={styles.newHeaderContainer}>
                <img src={BUSINESS_ICON} />
                <h2>Start New Business</h2>
            </div>

            <div className={styles.newNameContainer}>
                <div>
                    <label>Name Your Business:</label>
                    <input value={name} onChange={changeName} placeholder='Enter Name' />
                </div>
                <div>
                    <label>Employee Rank Increase:</label>
                    <input value={rank} onChange={changeRank} />
                </div>
            </div>

            <div className={styles.newContentContainer}>
                <div className={styles.newContentSearch}>
                    <h2 className={styles.searchButton}>Select Congregation</h2>
                    <input className={styles.stateInput} value={state} onChange={changeState} placeholder='Filter by State' />
                    <input className={styles.congregationInput} value={congregation} onChange={changeCongregation} placeholder='Filter by Congregation' />
                </div>
                <ul className={`${styles.searchResults}${searchLoader || congregations.length === 0 ? ` ${styles.searchResultsEmpty}` : ''}`}>
                    {
                        searchLoader ?
                        <div className={styles.searchResultsLoader}><Loading color='var(--color--subtext)' /></div> :
                        (
                            congregations.length === 0 ? 
                            <p style={{color: 'var(--color--subtext)', fontSize: 'smaller'}}>No Results</p> : 
                            congregations.filter(c => c.congregation_name.toLowerCase().includes(congregation.trim().toLowerCase()) && c.state.state_name.toLowerCase().includes(state.trim().toLowerCase())).map(congregation => {
                                return <SearchResult 
                                    key={`${congregation.state.state_id}_${congregation.congregation_id}`} 
                                    congregation={congregation} 
                                    selected={
                                        chosenCongregation !== undefined && 
                                        chosenCongregation.state.state_id === congregation.state.state_id && 
                                        chosenCongregation.congregation_id === congregation.congregation_id
                                    }
                                    passUp={setChosenCongregation}
                                />
                            })
                        )
                    }
                </ul>
            </div>

            <div className={styles.newFooterContainer}>
                <div className={styles.dropListWrapper}>
                    <DropList<BusinessType> selected={businessType} data={BUSINESS_TYPES} render={dropListRender} topMargin='-625%' />
                </div>
                <button className={styles.submitButton} type='submit' onClick={submit}>
                    {
                        purchaseLoader ? 
                        <div style={{height: '50%', aspectRatio: 1}}><Loading color='var(--color--text)' /></div> :
                        <>
                            <img src={COIN_ICON} />
                            <p>{NEW_BUSINESS_COST}</p>
                        </>
                    }
                </button>
            </div>
        </form>
    )
}

function BusinessListModule( { businessFetchTrigger } : { businessFetchTrigger: boolean } ) {
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
    }, [businessFetchTrigger])

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
    const { getUser } = useContext(UserContext)
    const [error, throwError] = useError()

    const [businessFetchTrigger, setBusinessFetchTrigger] = useState<boolean>(true)

    function refetchBusinesses() {
        setBusinessFetchTrigger(!businessFetchTrigger)
    }

    return (
        <div className={styles.page}>
            <p className={styles.error}>{error}</p>
            <NewBusinessModule throwError={throwError} refetchBusinesses={refetchBusinesses} refetchGold={getUser} />
            <BusinessListModule businessFetchTrigger={businessFetchTrigger} />
        </div>
    )
}