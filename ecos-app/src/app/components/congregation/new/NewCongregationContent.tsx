'use client'

import { BusinessType, EmpireData, GenericSuccess, NewBusiness, StateSlug } from "@/customs/utils/types"
import { API_STATE_ROUTE, BUSINESS_ICON, COIN_ICON, } from "@/customs/utils/constants"
import { ChangeEvent, MouseEvent, useContext, useEffect, useState } from "react"
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi"
import { NEW_CONGREGATION_COST } from "@/app/server/congregation"
import { createNewCongregation } from "@/customs/utils/actions"
import styles from "./css/newCongregationContent.module.css"
import { UserContext } from "../../context/UserProvider"
import { BUSINESS_TYPES } from "@/app/server/business"
import { EMPIRE_DATA } from "@/app/server/empire"
import useError from "@/customs/hooks/useError"
import DropList from "../../app/DropList"
import Loading from "@/app/loading"

interface NewBusinessesModuleProps {
    current: number
    setCurrent: (current: number) => void
    newBusinessesOne: NewBusiness
    setNewBusinessOne: (business: NewBusiness) => void
    newBusinessesTwo: NewBusiness
    setNewBusinessTwo: (business: NewBusiness) => void
    newBusinessesThree: NewBusiness
    setNewBusinessThree: (business: NewBusiness) => void
}

function NewCongregationHeader({ name, setName, taxRate, setTaxRate, split, setSplit } : { name: string, setName: (name: string) => void, taxRate: string, setTaxRate: (taxRate: string) => void, split: string, setSplit: (split: string) => void }) {

    return (
        <div className={styles.headerContent}>
            <div className={styles.headerInputContent}>
                <label>Create Congregation Name:</label>
                <input placeholder='Enter Name' value={name} onChange={e => { setName(e.target.value) }} />
            </div>
            
            <div className={styles.headerInputContent}>
                <label>Set Congregation Tax Rate:</label>
                <input placeholder='Enter Tax Rate' value={taxRate} onChange={e => { setTaxRate(e.target.value) }} />
            </div>

            <div className={styles.headerInputContent}>
                <label>Set Labor Split:</label>
                <input placeholder='Enter Labor Split' value={split} onChange={e => { setSplit(e.target.value) }} />
            </div>
        </div>
    )
}

function NewBusinessesModule({ current, setCurrent, newBusinessesOne, setNewBusinessOne, newBusinessesTwo, setNewBusinessTwo, newBusinessesThree, setNewBusinessThree } : NewBusinessesModuleProps) {

    function getCurrentBusiness(): NewBusiness {
        if (current === 0)
            return newBusinessesOne
        else if (current === 1) 
            return newBusinessesTwo
        else
            return newBusinessesThree
    }

    function changeName(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()

        let nameChange: NewBusiness

        if (current === 0) {
            nameChange = {...newBusinessesOne}
            nameChange.name = event.target.value
            setNewBusinessOne(nameChange)
        }
        else if (current === 1) {
            nameChange = {...newBusinessesTwo}
            nameChange.name = event.target.value
            setNewBusinessTwo(nameChange)
        }
        else {
            nameChange = {...newBusinessesThree}
            nameChange.name = event.target.value
            setNewBusinessThree(nameChange)
        }
    }

    function changeRank(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()

        let rankChange: NewBusiness

        if (current === 0) {
            rankChange = {...newBusinessesOne}
            rankChange.rank = event.target.value
            setNewBusinessOne(rankChange)
        }
        else if (current === 1) {
            rankChange = {...newBusinessesTwo}
            rankChange.rank = event.target.value
            setNewBusinessTwo(rankChange)
        }
        else {
            rankChange = {...newBusinessesThree}
            rankChange.rank = event.target.value
            setNewBusinessThree(rankChange)
        }
    }

    function selectBusinessType(selected: number): (event: MouseEvent<HTMLLIElement>) => void {
        return (event: MouseEvent<HTMLLIElement>) => {
            event.preventDefault()

            let typeChange: NewBusiness

            if (current === 0) {
                typeChange = {...newBusinessesOne}
                typeChange.businessType = selected
                setNewBusinessOne(typeChange)
            }
            else if (current === 1) {
                typeChange = {...newBusinessesTwo}
                typeChange.businessType = selected
                setNewBusinessTwo(typeChange)
            }
            else {
                typeChange = {...newBusinessesThree}
                typeChange.businessType = selected
                setNewBusinessThree(typeChange)
            }
        }
    }

    function decrementCurrent(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        if (current > 0)
            setCurrent(current - 1)
    }

    function incrementCurrent(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        if (current < 2)
            setCurrent(current + 1)
    }

    function dropListRender(item: BusinessType, selected?: number): JSX.Element | JSX.Element[] {
        return (
            <li key={`${item.title}_${Math.floor(Math.random() * 1000)}`} className={`${styles.dropListItem}${selected !== undefined ? ` ${styles.dropListItemHover}` : ``}`} onClick={selected !== undefined ? selectBusinessType(selected + 1) : () => {}}>
                <img src={item.icon} />
                {item.title}
            </li>
        )
    }

    return (
        <form className={styles.newBusinessModule}>
            <div className={styles.newHeaderContainer}>
                <img src={BUSINESS_ICON} />
                <h2>{`Create Business ${current + 1}`}</h2>
            </div>

            <div className={styles.newNameContainer}>
                <div>
                    <label>Name Your Business:</label>
                    <input value={getCurrentBusiness().name} onChange={changeName} placeholder='Enter Name' />
                </div>
                <div>
                    <label>Employee Rank Increase:</label>
                    <input value={getCurrentBusiness().rank} onChange={changeRank} placeholder='Enter Rank Increase' />
                </div>
            </div>

            <div className={styles.newContentContainer}>
                <p>
                    {
                        `Each new congregation must start with a minimum of 3 businesses. 
                        Use this menu to set the details of the starting businesses in your 
                        new congregation. Then, select a state to establish your new congregation 
                        in from the Select State Module and hit the purchase button to create the 
                        congregation with your entered details (provided you have sufficient funds). 
                        You may not change the state you establish a congregation in once created so 
                        be sure of your choice.`
                    }
                </p>
            </div>

            <div className={styles.newFooterContainer}>
                <div className={styles.dropListWrapper}>
                    <DropList<BusinessType> selected={getCurrentBusiness().businessType - 1} data={BUSINESS_TYPES} render={dropListRender} topMargin='-625%' />
                </div>
                <div className={styles.submitButton}>
                    <button onClick={decrementCurrent}><FiChevronLeft className={styles.chevron} /></button>
                    <p>{`${current + 1}/3`}</p>
                    <button onClick={incrementCurrent}><FiChevronRight className={styles.chevron} /></button>
                </div>
            </div>
        </form>
    )
}

function StateListModule({ selected, setSelected, submit } : { selected?: StateSlug, setSelected: (select: StateSlug) => void, submit: () => void }) {
    const [loader, setLoader] = useState<boolean>(false)

    const [states, setStates] = useState<StateSlug[]>([])
    const [search, setSearch] = useState<string>('')

    async function getStates() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_STATE_ROUTE}`).then(result => {
            return result.json()
        }).then(result => {
            setStates(result)
        })

        setLoader(false)
    }

    useEffect(() => {
        getStates()
    }, [])

    function StateResult({ state } : { state: StateSlug }) {
        const [empire, setEmpire] = useState<EmpireData | undefined>(EMPIRE_DATA.find(e => e.code === state.empire))

        return (
            <li className={styles.businessListResult}>
                <a>
                    <div className={styles.businessListResultName}>
                        <img src={empire ? empire.sigil.src : ''} alt='Sigil' />
                        <p>{state.state_name}</p>
                    </div>
                    <p className={styles.businessListResultState}>{`${(state.state_tax_rate * 100).toFixed(4)}%`}</p>
                    <p className={styles.businessListResultCongregation}>{`${state.state_owner_firstname} ${state.state_owner_lastname}`}</p>
                    <button className={selected?.state_id === state.state_id ? styles.selectedState : ''} onClick={ () => { setSelected(state) } }>
                        {
                            selected?.state_id === state.state_id ? 'Selected' : 'Select'
                        }
                    </button>
                </a>
            </li>
        )
    }

    return (
        <section className={styles.businessListModule}>
            <h2>Select State</h2>
            <div className={styles.searchState}>
                <input placeholder='Search State' value={search} onChange={e => { setSearch(e.target.value) }} />
                <button>
                    <FiSearch />
                </button>
            </div>
            <ul className={`${styles.businessList}${loader ? ` ${styles.listEmpty}` : ''}`}>
                {
                    loader ?
                    <div className={styles.businessListLoader}><Loading color='var(--color--subtext)' /></div> :
                    (
                        states.filter(s => s.state_name.toLowerCase().includes(search.toLowerCase())).map(state => {
                            return <StateResult key={state.state_id} state={state} />
                        })
                    )
                }
            </ul>
            <button className={styles.purchaseButton} onClick={() => { submit() }}>
                <img src={COIN_ICON} />
                <p>{NEW_CONGREGATION_COST}</p>
            </button>
        </section>
    )
}

export default function BusinessContent() {
    const { getUser } = useContext(UserContext)

    const [error, throwError] = useError()

    const [name, setName] = useState<string>('')

    const [split, setSplit] = useState<string>('')

    const [taxRate, setTaxRate] = useState<string>('')

    const [selected, setSelected] = useState<StateSlug>()

    const [current, setCurrent] = useState<number>(0)

    const [newBusinessesOne, setNewBusinessOne] = useState<NewBusiness>({
        index: 0,
        name: '',
        rank: '',
        businessType: 1
    })

    const [newBusinessesTwo, setNewBusinessTwo] = useState<NewBusiness>({
        index: 1,
        name: '',
        rank: '',
        businessType: 1
    })

    const [newBusinessesThree, setNewBusinessThree] = useState<NewBusiness>({
        index: 2,
        name: '',
        rank: '',
        businessType: 1
    })

    async function submit() {
        if (selected === undefined) {
            throwError('Select a state first')
            return
        }

        await createNewCongregation(selected, name, taxRate, split, [newBusinessesOne, newBusinessesTwo, newBusinessesThree]).then(result => {
            throwError(result.message)

            if ((result as GenericSuccess).success) {
                getUser() // refetch updated gold value
            }
        })
    }

    return (
        <>
            <header className={styles.header}>
                <NewCongregationHeader name={name} setName={setName} taxRate={taxRate} setTaxRate={setTaxRate} split={split} setSplit={setSplit} />
            </header>
            <main className={styles.page}>
                <p className={styles.error}>{error}</p>
                <NewBusinessesModule current={current} setCurrent={setCurrent} newBusinessesOne={newBusinessesOne} newBusinessesTwo={newBusinessesTwo} newBusinessesThree={newBusinessesThree} setNewBusinessOne={setNewBusinessOne} setNewBusinessTwo={setNewBusinessTwo} setNewBusinessThree={setNewBusinessThree} />
                <StateListModule selected={selected} setSelected={setSelected} submit={submit} />
            </main>
        </>
    )
}