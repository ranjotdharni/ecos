'use client'

import { GenericError, GenericSuccess, WorkerSlug } from "@/customs/utils/types"
import { ChangeEvent, MouseEvent, useEffect, useState } from "react"
import { editWorkers } from "@/customs/utils/actions"
import styles from "../css/workerModal.module.css"
import { useRouter } from "next/navigation"
import { FiX } from "react-icons/fi"

export interface RankChangeItem {
    workerId: string
    rank: number
}

export interface FiredItem {
    workerId: string
}

interface WorkerItemProps {
    worker: WorkerSlug
    addRankChange: (change: RankChangeItem) => void
    addFired: (fire: FiredItem) => void
    clear: boolean
}

interface WorkerModalProps { 
    visible: boolean
    setVisible: (visible: boolean) => void
    throwError: (error: string) => void
    workers: WorkerSlug[] 
    businessId: string
}

function WorkerItem({ worker, addRankChange, addFired, clear } : WorkerItemProps) {
    const [workerRank, setWorkerRank] = useState<number>(-1)

    // apparently setState works asynchronously, so this is the required syntax for the below function
    function onRankChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()

        const newRank: number = event.target.valueAsNumber
        setWorkerRank(newRank)

        if (newRank < 0) {
            setWorkerRank(0)
            return
        }

        addRankChange({ 
            workerId: worker.worker_id,
            rank: newRank
        })
    }

    function onFired(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        addFired({
            workerId: worker.worker_id
        })
    }

    useEffect(() => {
        setWorkerRank(worker.worker_rank)
    }, [clear])

    return (
        <li className={styles.workerItem}>
            <p>{`${worker.firstname} ${worker.lastname}`}</p>
            <div className={styles.workerItemRank}>
                <label>Rank:</label>
                <input type='number' value={workerRank} onChange={onRankChange} />
            </div>
            <div className={styles.workerItemFire}>
                <button onClick={onFired}>Fire</button>
            </div>
        </li>
    )
}

export default function WorkerModal({ visible, setVisible, throwError, workers, businessId } : WorkerModalProps) {
    const router = useRouter()
    const [clear, clearChanges] = useState<boolean>(true)

    const [rankChange, setRankChange] = useState<RankChangeItem[]>([])
    const [fired, setFired] = useState<FiredItem[]>([])

    function addRankChange(change: RankChangeItem) {
        let editedItems: RankChangeItem[] = [...rankChange]

        if (fired.find(f => f.workerId === change.workerId)) {
            return
        }

        if (editedItems.find(i => i.workerId === change.workerId) === undefined) {
            editedItems.push(change)
            setRankChange(editedItems)
            return
        }

        if (workers.find(w => w.worker_id === change.workerId && Number(w.worker_rank) === change.rank)) {
            setRankChange(editedItems.filter(i => i.workerId !== change.workerId))
            return
        }

        editedItems = editedItems.filter(i => i.workerId !== change.workerId)
        editedItems.push(change)
        setRankChange(editedItems)
    }

    function addFired(fire: FiredItem) {
        let editedItems: FiredItem[] = [...fired]

        if (rankChange.find(c => c.workerId === fire.workerId) !== undefined)
            setRankChange(rankChange.filter(c => c.workerId !== fire.workerId))

        if (editedItems.find(i => i.workerId === fire.workerId) !== undefined) {
            return
        }

        editedItems.push(fire)
        setFired(editedItems)
    }

    function onCancel(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setRankChange([])
        setFired([])
        clearChanges(!clear)
    }

    function onClose(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setRankChange([])
        setFired([])
        clearChanges(!clear)
        setVisible(false)
    }

    async function onSave(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        await editWorkers(businessId, rankChange, fired).then(result => {
            throwError(result.message)

            if ((result as GenericError).error) {
                setRankChange([])
                setFired([])
                clearChanges(!clear)
                setVisible(false)
            }

            if ((result as GenericSuccess).success) {
                router.refresh()
            }
        })
    }
    
    return (
        <div className={styles.container} style={{display: (visible ? 'flex' : 'none')}}>
            <div className={styles.wrapper}>
                <div className={styles.titleWrapper}>
                    <h2>Edit Workers</h2>
                    <button onClick={onClose}><FiX /></button>
                </div>
                <div className={styles.contentWrapper}>
                    <ul className={styles.workerList}>
                        {
                            workers.map(worker => {
                                if (fired.find(f => f.workerId === worker.worker_id) !== undefined)
                                    return <></>
                                else
                                    return <WorkerItem key={worker.worker_id} worker={worker} addRankChange={addRankChange} addFired={addFired} clear={clear} />
                            })
                        }
                    </ul>
                </div>
                <div className={styles.questionWrapper}>
                    <p>Don't forget to save any changes!</p>
                    <div className={styles.buttonWrapper}>
                        <button onClick={onCancel}>Cancel</button>
                        <button onClick={onSave}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    )
}