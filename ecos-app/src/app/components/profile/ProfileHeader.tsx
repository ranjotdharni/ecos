'use client'

import { EmpireData, ProfileType, UserDetails } from "@/customs/utils/types"
import styles from "./css/profileHeader.module.css"
import { PROFILE_DATA } from "@/app/server/profile"
import { EMPIRE_DATA } from "@/app/server/empire"
import useError from "@/customs/hooks/useError"
import Loading from "@/app/loading"
import PFPModal from "./PFPModal"
import { useState } from "react"

export default function ProfileHeader({ user, getUser } : { user: UserDetails, getUser: () => void }) {
    const [error, throwError] = useError()
    const [loader, setLoader] = useState<boolean>(false)
    const [pfpModalVisible, setPfpModalVisible] = useState<boolean>(false)

    const [profileData, setProfileData] = useState<ProfileType>(PROFILE_DATA.find(p => p.code === Number(user.pfp))!)
    const [empireData, setEmpireData] = useState<EmpireData>(EMPIRE_DATA.find(e => e.code === Number(user.empire))!)

    return (
        <header className={styles.header}>
            {
                loader || user === undefined || profileData === undefined ? 
                <div className={styles.loader}><Loading color='var(--color--text)' /></div> :
                <>
                    <p className={styles.error}>{error}</p>
                    <PFPModal user={user} getUser={getUser} pfp={profileData} setPfp={setProfileData} visible={pfpModalVisible} setVisible={setPfpModalVisible} throwError={throwError} />
                    <div className={styles.userInfo}>
                        <img onClick={e => setPfpModalVisible(true)} src={profileData?.icon} />
                        <h1>{user?.username}</h1>
                    </div>
                    <div className={styles.userEmpire}>
                        <img src={empireData?.sigil.src} />
                    </div>
                </>
            }
        </header>
    )
}