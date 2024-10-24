'use client'

import ConfirmModal, { Confirm } from "../confirm/ConfirmModal"
import { UserDetails } from "@/customs/utils/types"
import React, { useState } from "react"

export const UserContext = React.createContext<{ user: UserDetails, setModal: (slug: Confirm) => void }>({
    user: {
        username: '',
        firstname: '',
        lastname: '',
        empire: 0,
        gold: 0
    },
    setModal: () => {}
})

export default function UserProvider({ children, userDetails } : { children: React.ReactNode, userDetails: UserDetails }) {

    const [modalSlug, setModal] = useState<Confirm>({
        title: '',
        message: '',
        question: '',
        callback: () => {}
    })

    return (
        <UserContext.Provider value={ { user: userDetails, setModal: setModal } }>
            <ConfirmModal slug={modalSlug} />
            {children}
        </UserContext.Provider>
    )
}