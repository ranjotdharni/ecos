'use client'

import { COIN_ICON } from "@/customs/utils/constants"
import { UserContext } from "../context/UserProvider"
import styles from "./navbar.module.css"
import { useContext } from "react"

export default function NavBar() {
    const { user } = useContext(UserContext)

    return (
        <section className={styles.container}>
            <img src={COIN_ICON} />
            <p>{user.gold}</p>
        </section>
    )
}