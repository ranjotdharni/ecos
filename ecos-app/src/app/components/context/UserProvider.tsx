'use client'

import ConfirmModal, { Confirm } from "../confirm/ConfirmModal"
import React, { useState } from "react"

export const UserContext = React.createContext<{ setModal: (slug: Confirm) => void, userTrigger: boolean, getUser: () => void }>({
    userTrigger: true,
    setModal: () => {},
    getUser: () => {}
})

export default function UserProvider({ children } : { children: React.ReactNode }) {
    const [trigger, setTrigger] = useState<boolean>(true)

    const [modalSlug, setModal] = useState<Confirm>({
        title: '',
        message: '',
        question: '',
        callback: () => {}
    })

    function getUser() {
        setTrigger(!trigger)
    }

    return (
        <UserContext.Provider value={ { setModal: setModal, userTrigger: trigger, getUser: getUser } }>
            <ConfirmModal slug={modalSlug} />
            {children}
        </UserContext.Provider>
    )
}