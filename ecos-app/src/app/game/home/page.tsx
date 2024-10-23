'use client'

import { Context } from "../layout"
import { useContext } from "react"


export default function Home() {
    const { setModal } = useContext(Context)

    return (
        <section style={{width: '100%', height: '90vh', display: 'grid', placeItems: 'center'}}>
            <h1>This is the Home page.</h1>
            <button onClick={() => { setModal({title: 'Are You Sure', message: 'This action is a test.', question: 'Are you sure you want to continue?', callback: () => {console.log('Hello, World')}}) }}>Test Modal</button>
        </section>
    )
}