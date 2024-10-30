'use client'

import { MouseEvent, useState } from "react"
import styles from "./css/dropList.module.css"

interface GenericProps {
    title: string
}

interface DropListProps<T extends GenericProps> {
    data: T[]
    render: (item: T, selected?: number) => JSX.Element | JSX.Element[]
    selected: number
    topMargin?: string
}

export default function DropList<T extends GenericProps>({ data, render, selected, topMargin } : DropListProps<T>) {
    const [open, setOpen] = useState<boolean>(false)

    function openOrClose(event: MouseEvent<HTMLDivElement>) {
        event.preventDefault()
        setOpen(!open)
    }

    return (
        <div className={styles.container} style={{flexDirection: (topMargin !== undefined ? 'column-reverse' : 'column')}} tabIndex={0}>
            {render(data[selected])}
            <ul className={styles.list} style={{top: (topMargin !== undefined ? topMargin : '110%')}}>
                {
                    data.map((item, index) => {
                        return (
                            render(item, index)
                        )
                    })
                }
            </ul>
        </div>
    )
} // {`${styles.list}${open ? ` ${styles.open}` : ``}`}