'use client'

import { API_CONGREGATION_OWNER_ROUTE, API_CONGREGATION_ROUTE, API_INVITE_ROUTE, API_USER_DETAILS_ROUTE, COIN_ICON, CONGREGATION_ICON, INVITE_ICON } from "@/customs/utils/constants"
import { CongregationSlug, CongregationType, GenericSuccess, StateInvite } from "@/customs/utils/types"
import { INVITE_ACCEPT_CODE, INVITE_DEFAULT_CODE, STATE_INVITE_CODE } from "@/app/server/invite"
import { MINIMUM_CONGREGATIONS_PER_STATE, NEW_STATE_COST } from "@/app/server/state"
import { ChangeEvent, MouseEvent, useContext, useEffect, useState } from "react"
import { makeNewState, sendStateInvite } from "@/customs/utils/actions"
import { CONGREGATION_TYPES } from "@/app/server/congregation"
import { UserContext } from "../../context/UserProvider"
import useError from "@/customs/hooks/useError"
import styles from "./newStatePage.module.css"
import Loading from "@/app/loading"

function CongregationSelectList({ throwError, selectedCongregations, selectCongregation, deselectCongregations } : { throwError: (error: string) => void, selectedCongregations: CongregationSlug[], selectCongregation: (congregation: CongregationSlug) => void, deselectCongregations: (congregation: CongregationSlug) => void }) {
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

        function select(event: MouseEvent<HTMLButtonElement>) {
            event.preventDefault()

            if (selectedCongregations.find(s => s.congregation_id === congregation.congregation_id) !== undefined) {
                deselectCongregations(congregation)
            }
            else {
                selectCongregation(congregation)
            }
        }

        return (
            <li className={styles.csItem}>
                <div className={styles.csItemHeader}>
                    <img src={congregationType?.icon} />
                    <h2>{congregation.congregation_name}</h2>
                </div>
                <div className={styles.csItemBodyOne}>
                    <p>{congregation.state.state_name}</p>
                    <div className={styles.csItemButtons}>
                        <button onClick={select} className={selectedCongregations.find(s => s.congregation_id === congregation.congregation_id) !== undefined ? styles.csItemButtonReady : ''}>{selectedCongregations.find(s => s.congregation_id === congregation.congregation_id) !== undefined ? 'Selected' : 'Select'}</button>
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
                        congregations!.filter(c => c.state.state_name.toLowerCase().includes(stateFilter.trim().toLowerCase()) && c.congregation_name.toLowerCase().includes(congregationFilter.trim().toLowerCase())).map(congregation => {
                            return <CongregationSelectItem congregation={congregation} />
                        })
                    )
                }
            </ul>
        </div>
    )
}

function InviteSelectList({ throwError, selectedInvites, selectInvite, deselectInvite } : { throwError: (error: string) => void, selectedInvites: StateInvite[], selectInvite: (invite: StateInvite) => void, deselectInvite: (invite: StateInvite) => void }) {
    const [loader, setLoader] = useState<boolean>(false)

    const [userId, setUserId] = useState<string>()
    const [ownedCongregations, setOwnedCongregations] = useState<CongregationSlug[]>()
    const [congregations, setCongregations] = useState<CongregationSlug[]>()
    const [invites, setInvites] = useState<StateInvite[]>()
    const [invited, setInvited] = useState<string[]>([])
    const [stateFilter, setStateFilter] = useState<string>('')
    const [congregationFilter, setCongregationFilter] = useState<string>('')
    const [congregationOwnerFilter, setCongregationOwnerFilter] = useState<string>('')

    function filterState(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setStateFilter(event.target.value)
    }

    function filterCongregation(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setCongregationFilter(event.target.value)
    }

    function filterCongregationOwner(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setCongregationOwnerFilter(event.target.value)
    }

    function addToInvited(congregationId: string) {
        const newInvitedList: string[] = [...invited]
        newInvitedList.push(congregationId)
        setInvited(newInvitedList)
    }

    function findPriority(c: CongregationSlug) {
        if (invited.find(i => i === c.congregation_id) !== undefined || invites?.find(i => i.to.congregation_id === c.congregation_id) !== undefined)
            return 0
        else 
            return 1
    }

    async function getComponentData() {
        setLoader(true)

        const user_id: string = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_USER_DETAILS_ROUTE}`).then(async response => {
            return await response.json()
        }).then(result => {
            if (result.error !== undefined) {
                throwError(result.message)
                return ''
            }
            return result.user_id
        })

        setUserId(user_id)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_CONGREGATION_OWNER_ROUTE}`).then(async response => {
            return await response.json()
        }).then(result => {
            if (result.error !== undefined)
                throwError(result.error)
            else
                setOwnedCongregations(result.congregations)
        })

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_CONGREGATION_ROUTE}`).then(async response => {
            return await response.json()
        }).then(result => {
            if (result.error !== undefined)
                throwError(result.message)
            else
                setCongregations(result.congregations)
        })

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_INVITE_ROUTE}`, {
            method: 'POST',
            body: JSON.stringify({
                from: user_id,
                type: STATE_INVITE_CODE
            })
        }).then(async response => {
            return await response.json()
        }).then(result => {
            if (result.error !== undefined)
                throwError(result.message)
            else {
                setInvites(result)
            }
        })

        setLoader(false)
    }

    useEffect(() => {
        getComponentData()
    }, [])

    function CongregationSelectItem({ congregation, status, addToInvited } : { congregation: CongregationSlug, status?: number, addToInvited: (congregationId: string) => void }) {
        const [congregationType, setCongregationType] = useState<CongregationType | undefined>(CONGREGATION_TYPES.find(c => c.type === Number(congregation.congregation_status)))
        const [loader, setLoader] = useState<boolean>(false)

        async function sendInvite(event: MouseEvent<HTMLButtonElement>) {
            event.preventDefault()

            if (status !== undefined || loader)
                return

            setLoader(true)

            await sendStateInvite(congregation.congregation_id).then(result => {
                throwError(result.message)

                if ((result as GenericSuccess).success !== undefined) {
                    addToInvited(congregation.congregation_id)
                }
            })

            setLoader(false)
        }

        function select(event: MouseEvent<HTMLButtonElement>) {
            event.preventDefault()

            if (Number(status) !== INVITE_ACCEPT_CODE)
                return

            if (selectedInvites.find(s => s.to.congregation_id === congregation.congregation_id) !== undefined && invites!.find(i => i.to) !== undefined) {
                deselectInvite(invites!.find(i => i.to.congregation_id === congregation.congregation_id)!)
            }
            else if (invites!.find(i => i.to) !== undefined) {
                selectInvite(invites!.find(i => i.to.congregation_id === congregation.congregation_id)!)
            }
        }

        return (
            <li className={styles.csItem}>
                <div className={styles.csItemHeader}>
                    <img src={congregationType?.icon} />
                    <h2>{congregation.congregation_name}</h2>
                </div>
                <div className={styles.csItemBodyOne}>
                    <p>{congregation.state.state_name}</p>
                    <div className={styles.csItemButtons}>
                        <button className={selectedInvites.find(s => s.to.congregation_id === congregation.congregation_id) !== undefined ? styles.csItemButtonReady : ''} onClick={select}>{selectedInvites.find(s => s.to.congregation_id === congregation.congregation_id) !== undefined ? 'Selected' : 'Select'}</button>
                    </div>
                </div>
                <div className={styles.isItemBodyTwo}>
                    <p>{`${congregation.congregation_owner_firstname} ${congregation.congregation_owner_lastname}`}</p>
                    <button onClick={sendInvite}>
                        {
                            loader ? 
                            <div style={{height: '50%', aspectRatio: 1}}><Loading color='var(--color--text)' /></div> :
                            (
                                status === INVITE_DEFAULT_CODE ? 
                                'Pending' : 
                                (
                                    status === INVITE_ACCEPT_CODE ?
                                    'Accepted' :
                                    'Invite'
                                )
                            )
                        }
                    </button>
                </div>
            </li>
        )
    }

    return (
        <div className={styles.csList}>
            <div className={styles.csHeader}>
                <img src={INVITE_ICON} />
                <h1>Invite Congregations</h1>
            </div>
            <div className={styles.csListFilters}>
                <input placeholder='Filter By State' onChange={filterState} />
                <input placeholder='Filter By Congregation' onChange={filterCongregation} />
                <input placeholder='Filter By Congregation Owner' onChange={filterCongregationOwner} />
            </div>
            <ul className={userId === undefined || invites === undefined || ownedCongregations === undefined || congregations === undefined || loader || congregations!.filter(c => ownedCongregations!.find(oc => oc.congregation_id === c.congregation_id) === undefined).length === 0 ? '' : styles.ready}>
                {
                    congregations === undefined || loader ? 
                    <div className={styles.loader}><Loading color='var(--color--text)' /></div> :
                    (
                        userId === undefined || invites === undefined || congregations!.filter(c => ownedCongregations!.find(oc => oc.congregation_id === c.congregation_id) === undefined).length === 0 ?
                        <p>No Congregations to Invite</p> :
                        congregations!.filter(c => ownedCongregations!.find(oc => oc.congregation_id === c.congregation_id) === undefined).filter(c => c.state.state_name.toLowerCase().includes(stateFilter.trim().toLowerCase()) && c.congregation_name.toLowerCase().includes(congregationFilter.trim().toLowerCase()) && `${c.congregation_owner_firstname} ${c.congregation_owner_lastname}`.toLowerCase().includes(congregationOwnerFilter.trim().toLowerCase())).toSorted((a, b) => { return findPriority(a) - findPriority(b) }).map(congregation => {
                            return <CongregationSelectItem congregation={congregation} status={invited.find(i => i === congregation.congregation_id) !== undefined ? INVITE_DEFAULT_CODE : invites.find(i => i.to.congregation_id === congregation.congregation_id)?.accepted} addToInvited={addToInvited} />
                        })
                    )
                }
            </ul>
        </div>
    )
}

export default function NewStatePage() {
    const { getUser } = useContext(UserContext)
    const [error, throwError] = useError()

    const [selectedCongregations, setSelectedCongregations] = useState<CongregationSlug[]>([])
    const [selectedInvites, setSelectedInvites] = useState<StateInvite[]>([])
    const [purchaseLoader, setPurchaseLoader] = useState<boolean>(false)
    const [name, setName] = useState<string>('')
    const [tax, setTax] = useState<string>('')

    function changeName(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setName(event.target.value)
    }

    function changeTax(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setTax(event.target.value)
    }

    function selectCongregation(congregation: CongregationSlug) {
        if (selectedCongregations.find(s => s.congregation_id === congregation.congregation_id) !== undefined)
            return

        const newList: CongregationSlug[] = [...selectedCongregations]
        newList.push(congregation)
        setSelectedCongregations(newList)
    }

    function deselectCongregation(congregation: CongregationSlug) {
        if (selectedCongregations.find(s => s.congregation_id === congregation.congregation_id) === undefined)
            return

        const newList: CongregationSlug[] = selectedCongregations.filter(s => s.congregation_id !== congregation.congregation_id)
        setSelectedCongregations(newList)
    }

    function selectInvite(invite: StateInvite) {
        if (selectedInvites.find(s => s.to.congregation_id === invite.to.congregation_id) !== undefined)
            return

        const newList: StateInvite[] = [...selectedInvites]
        newList.push(invite)
        setSelectedInvites(newList)
    }

    function deselectInvite(invite: StateInvite) {
        if (selectedInvites.find(s => s.to === invite.to) === undefined)
            return

        const newList: StateInvite[] = selectedInvites.filter(s => s.to.congregation_id !== invite.to.congregation_id)
        setSelectedInvites(newList)
    }

    async function purchase(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (purchaseLoader)
            return

        setPurchaseLoader(true)

        await makeNewState(name.trim(), tax.trim(), selectedCongregations, selectedInvites).then(result => {
            throwError(result.message)

            if ((result as GenericSuccess).success !== undefined) {
                getUser()
            }
        })

        setPurchaseLoader(false)
    }

    return (
        <main className={styles.container}>
            <div className={styles.error}>
                <p>{error}</p>
            </div>
            <div className={styles.nsHeaderContainer}>
                <div className={styles.nameInputWrapper}>
                    <label>State Name:</label>
                    <input placeholder='Enter State Name' value={name} onChange={changeName} />
                </div>
                <div className={styles.taxInputWrapper}>
                    <label>State Tax Rate:</label>
                    <input placeholder='Enter Tax Rate' value={tax} onChange={changeTax} />
                </div>
                <div className={styles.countWrapper}>
                    {
                        selectedCongregations.length + selectedInvites.length > MINIMUM_CONGREGATIONS_PER_STATE - 1 ? 
                        <button className={styles.purchaseButton} onClick={purchase}>
                            {
                                purchaseLoader ? 
                                <div style={{height: '50%', aspectRatio: 1}}><Loading color='var(--color--text)' /></div> :
                                <>
                                    <img src={COIN_ICON} />
                                    {NEW_STATE_COST}
                                </> 
                            }
                        </button> : 
                        <p>{`${selectedCongregations.length + selectedInvites.length}/${MINIMUM_CONGREGATIONS_PER_STATE}`}</p>
                    }
                </div>
            </div>
            <div className={styles.nsContentContainer}>
                <CongregationSelectList selectedCongregations={selectedCongregations} selectCongregation={selectCongregation} deselectCongregations={deselectCongregation} throwError={throwError} />
                <InviteSelectList selectedInvites={selectedInvites} selectInvite={selectInvite} deselectInvite={deselectInvite} throwError={throwError} />
            </div>
        </main>
    )
}