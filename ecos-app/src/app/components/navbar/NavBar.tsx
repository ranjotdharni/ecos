'use client'

import { AUTH_ROUTE, BUSINESS_ICON, BUSINESS_PAGE_ROUTE, COIN_ICON, CONGREGATION_ICON, CONGREGATION_PAGE_ROUTE, DEFAULT_SUCCESS_ROUTE, EMPIRE_PAGE_ROUTE, HOMEPAGE_ICON, JOB_ICON, JOB_PAGE_ROUTE, STATE_ICON, STATE_PAGE_ROUTE } from "@/customs/utils/constants"
import { MouseEvent, useContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { UserContext } from "../context/UserProvider"
import { UserDetails } from "@/customs/utils/types"
import { fetchUser } from "@/customs/utils/tools"
import { EMPIRE_DATA } from "@/app/server/empire"
import { signOut } from "@/app/server/auth"
import styles from "./navbar.module.css"
import Loading from "@/app/loading"

export default function NavBar() {
    const router = useRouter()
    const pathname = usePathname()
    const { userTrigger } = useContext(UserContext)

    const [isOpen, setOpen] = useState<boolean>(false)
    const [isLoading, setLoading] = useState<boolean>(false)
    const [user, setUser] = useState<UserDetails>()

    function open(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setOpen(true)
    }

    function close(event: MouseEvent<HTMLElement>) {
        event.preventDefault()
        setOpen(false)
    }

    async function signUserOut(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (!user)
            return
        
        setLoading(true)

        await signOut(user.username).then(result => {
            if (result)
                console.log(result)
            else
                router.push(AUTH_ROUTE)
        })

        setLoading(false)
    }

    async function getUser() {
        const u: UserDetails = await fetchUser()
        setUser(u)
    }

    useEffect(() => {
        getUser()
    }, [userTrigger])

    return (
        <section className={styles.container}>
            <button onClick={open} className={styles.start}>
                <div></div>
                <div></div>
                <div></div>
            </button>

            <div className={styles.end}>
                <img src={COIN_ICON} />
                <p>{user?.gold}</p>
            </div>

            <section onClick={close} className={`${styles.cover} ${isOpen ? styles.open : ''}`}></section>

            <div className={`${styles.content} ${isOpen ? styles.slide : ''}`}>
                <div className={styles.header}>
                    <p className={styles.headerName}>{user && user.firstname.length + user.lastname.length > 32 ? user.firstname : `${user?.firstname} ${user?.lastname}`}</p>
                    <div className={styles.gold}>
                        <img src={COIN_ICON} />
                        <p>{user?.gold}</p>
                    </div>
                </div>

                <a href={DEFAULT_SUCCESS_ROUTE} className={`${styles.item} ${pathname.includes(DEFAULT_SUCCESS_ROUTE) ? styles.highlight : ``}`}>
                    <img src={HOMEPAGE_ICON} />
                    <p>Home</p>
                </a>

                <a href={EMPIRE_PAGE_ROUTE} className={`${styles.item} ${pathname.includes(EMPIRE_PAGE_ROUTE) ? styles.highlight : ``}`}>
                    <img src={EMPIRE_DATA.find(empire => empire.code === user?.empire)?.sigil.src} />
                    <p>Empire</p>
                </a>

                <a href={JOB_PAGE_ROUTE} className={`${styles.item} ${pathname.includes(JOB_PAGE_ROUTE) ? styles.highlight : ``}`}>
                    <img src={JOB_ICON} />
                    <p>Job</p>
                </a>

                <a href={BUSINESS_PAGE_ROUTE} className={`${styles.item} ${pathname.includes(BUSINESS_PAGE_ROUTE) ? styles.highlight : ``}`}>
                    <img src={BUSINESS_ICON} />
                    <p>Businesses</p>
                </a>

                <a href={CONGREGATION_PAGE_ROUTE} className={`${styles.item} ${pathname.includes(CONGREGATION_PAGE_ROUTE) ? styles.highlight : ``}`}>
                    <img src={CONGREGATION_ICON} />
                    <p>Congregations</p>
                </a>

                <a href={STATE_PAGE_ROUTE} className={`${styles.item} ${pathname.includes(STATE_PAGE_ROUTE) ? styles.highlight : ``}`}>
                    <img src={STATE_ICON} />
                    <p>States</p>
                </a>

                <div className={styles.footer}>
                    <button onClick={signUserOut} className={styles.signout}>{isLoading ? <div className={styles.loader}><Loading color='var(--color--subtext)' /></div> : 'Sign Out'}</button>
                </div>
            
            </div>

        </section>
    )
}