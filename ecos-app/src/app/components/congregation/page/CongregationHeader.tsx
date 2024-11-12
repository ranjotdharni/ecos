'use client'

import { COIN_ICON } from "@/customs/utils/constants"
import styles from "./css/congregationHeader.module.css"

export default function CongregationHeader() {

    return (
        <header className={styles.container}>
            <img src={COIN_ICON} />
            <h1>0.00</h1>
        </header>
    )
}