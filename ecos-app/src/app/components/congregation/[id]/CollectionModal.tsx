'use client'

import { API_COLLECTION_CONGREGATION_ROUTE, BUSINESS_PAGE_ROUTE, COIN_ICON } from "@/customs/utils/constants"
import { BusinessType, CollectionSlug } from "@/customs/utils/types"
import { MouseEvent, useEffect, useState } from "react"
import { BUSINESS_TYPES } from "@/app/server/business"
import styles from "./css/collectionModal.module.css"
import { dateToFormat } from "@/customs/utils/tools"
import { useRouter } from "next/navigation"
import { FiX } from "react-icons/fi"
import Loading from "@/app/loading"

interface CollectionModalProps { 
    visible: boolean
    setVisible: (visible: boolean) => void
    congregationId: string
}

function CollectionItem({ collection } : { collection: CollectionSlug }) {
    const [businessType, setBusinessType] = useState<BusinessType | undefined>(BUSINESS_TYPES.find(t => t.type === collection.business.business_type))

    return (
        <li className={styles.collectionItem}>
            <a href={`${BUSINESS_PAGE_ROUTE}/${collection.business.business_id}`}>
                <div className={styles.itemHeader}>
                    <img src={businessType?.icon} />
                    <p>{collection.business.business_name}</p>
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

export default function CollectionModal({ visible, setVisible, congregationId } : CollectionModalProps) {
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

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_COLLECTION_CONGREGATION_ROUTE}`, {
            method: 'POST',
            body: JSON.stringify({
                congregationId: congregationId
            })
        }).then(result => {
            return result.json()
        }).then(result => {
            if (result.error !== undefined) {
                console.log(result.message)
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
                    <p>Click a collection to view the business.</p>
                </div>
            </div>
        </div>
    )
}