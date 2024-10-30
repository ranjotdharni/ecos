import { BUSINESS_ICON } from "@/customs/utils/constants"
import styles from "./css/businessContent.module.css"

const test: SearchResult[] = [
    { 
        key: '1',
        state: 'State Name', 
        str: 0.025, 
        congregation: 'Congregation Name', 
        ctr: 0.075 
    },
    { 
        key: '2',
        state: 'State Name', 
        str: 0.025, 
        congregation: 'Congregation Name', 
        ctr: 0.075 
    },
    { 
        key: '3',
        state: 'State Name', 
        str: 0.025, 
        congregation: 'Congregation Name', 
        ctr: 0.075 
    },
    { 
        key: '4',
        state: 'State Name', 
        str: 0.025, 
        congregation: 'Congregation Name', 
        ctr: 0.075 
    },
    { 
        key: '5',
        state: 'State Name', 
        str: 0.025, 
        congregation: 'Congregation Name', 
        ctr: 0.075 
    },
    { 
        key: '6',
        state: 'State Name', 
        str: 0.025, 
        congregation: 'Congregation Name', 
        ctr: 0.075 
    }
]

interface SearchResult { 
    key: string
    state: string 
    str: number 
    congregation: string 
    ctr: number 
}

function NewBusinessModule() {

    function SearchResult({ props } : { props: SearchResult }) {

        return (
            <li className={styles.searchResult}>

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
                                <SearchResult key={result.key} props={result} />
                            )
                        })
                    }
                </ul>
            </div>

            <div className={styles.newFooterContainer}>

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