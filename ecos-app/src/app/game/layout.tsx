'use client'

import React, { useState } from "react"
import ConfirmModal, { Confirm } from "../components/confirm/ConfirmModal"
import NavBar from "../components/navbar/NavBar"

export const Context = React.createContext<{ setModal: (slug: Confirm) => void }>({
    setModal: () => {}
})

export default function Layout({ children } : { children: React.ReactNode }) {

    const [modalSlug, setModal] = useState<Confirm>({
        title: '',
        message: '',
        question: '',
        callback: () => {}
    })


    return (
        <Context.Provider value={ { setModal: setModal } }>
            <ConfirmModal slug={modalSlug} />
            {/* Always leave 5vh at top of each page for navbar */}
            <NavBar />
            {children}
        </Context.Provider>
    )
}