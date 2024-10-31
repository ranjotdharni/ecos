'use client'

import styles from "./css/dropList.module.css"

interface DropListProps<T> {
    data: T[]
    render: (item: T, selected?: number) => JSX.Element | JSX.Element[]
    selected: number
    topMargin?: string
}

export default function DropList<T>({ data, render, selected, topMargin } : DropListProps<T>) {

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
}