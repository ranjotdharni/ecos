'use client'

import { BUSINESS_ICON, COIN_ICON, CONGREGATION_ICON, LABOR_SPLIT_ICON, STATE_ICON } from "@/customs/utils/constants"
import styles from "./css/businessContent.module.css"
import { BUSINESS_TYPES, NEW_BUSINESS_COST } from "@/app/server/business"
import DropList from "../../app/DropList"
import { MouseEvent, useState } from "react"
import { BusinessType } from "@/customs/utils/types"

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
            <li className={`${styles.dropListItem}${selected !== undefined ? ` ${styles.dropListItemHover}` : ``}`} onClick={selected !== undefined ? selectBusinessType(selected) : () => {}}>
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
                <label>Name Your Business:</label>
                <input placeholder='Enter Name' />
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

    return (
        <section className={styles.businessListModule}>

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