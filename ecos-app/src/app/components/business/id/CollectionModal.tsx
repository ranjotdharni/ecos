'use client'

import { API_COLLECTION_BUSINESS_ROUTE, BUSINESS_ICON, COIN_ICON } from "@/customs/utils/constants"
import { MouseEvent, useEffect, useState } from "react"
import { CollectionSlug } from "@/customs/utils/types"
import styles from "../css/collectionModal.module.css"
import { dateToFormat } from "@/customs/utils/tools"
import { useRouter } from "next/navigation"
import { FiX } from "react-icons/fi"
import Loading from "@/app/loading"

interface CollectionModalProps { 
    visible: boolean
    setVisible: (visible: boolean) => void
    throwError: (error: string) => void
    businessId: string
}

function CollectionItem({ collection } : { collection: CollectionSlug }) {
    return (
        <li className={styles.collectionItem}>
            <a>
                <div className={styles.itemHeader}>
                    <img src={BUSINESS_ICON} />
                    <p>{`By ${collection.business.business_owner_firstname} ${collection.business.business_owner_lastname}`}</p>
                </div>
                <div className={styles.itemAmount}>
                    <img src={COIN_ICON} />
                    <p>{(collection.revenue * collection.ctr).toFixed(2)}</p>
                </div>
                <div className={styles.itemDate}>
                    <p>{`${dateToFormat('MMM DD, YYYY', new Date(collection.collected_at))} ${new Date(collection.collected_at).toLocaleTimeString('en-US', { hour12: true })}`}</p>
                </div>
            </a>
        </li>
    )
}

export default function CollectionModal({ visible, setVisible, throwError, businessId } : CollectionModalProps) {
    const router = useRouter()

    const [loader, setLoader] = useState<boolean>(false)
    const [collections, setCollections] = useState<CollectionSlug[]>([])

    function onClose(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setVisible(false)
    }

    async function getCollections() {
        if (!visible)
            return

        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_COLLECTION_BUSINESS_ROUTE}`, {
            method: 'POST',
            body: JSON.stringify({
                businessId: businessId
            })
        }).then(result => {
            return result.json()
        }).then(result => {
            if (result.error !== undefined) {
                throwError(result.message)
                setVisible(false)
            }

            setCollections(result as CollectionSlug[])
        })

        setLoader(false)
    }

    useEffect(() => {
        getCollections()
    }, [visible])
    
    return (
        <div className={styles.container} style={{display: (visible ? 'flex' : 'none')}}>
            <div className={styles.wrapper}>
                <div className={styles.titleWrapper}>
                    <h2>Business Collections</h2>
                    <button onClick={onClose}><FiX /></button>
                </div>
                <div className={styles.contentWrapper}>
                    <ul className={`${styles.workerList} ${loader || collections.length === 0 ? styles.workerListCenter : ''}`}>
                        {
                            loader ? 
                            <div className={styles.loader}><Loading color='var(--color--text)' /></div> : 
                            (
                                collections.length === 0 ? 
                                <p className={styles.noCollections}>No Collections</p> :
                                collections.map(collection => {
                                    return <CollectionItem collection={collection} />
                                })
                            )
                        }
                    </ul>
                </div>
                <div className={styles.questionWrapper}>
                    <p>Your most recent collections will show first.</p>
                </div>
            </div>
        </div>
    )
}