import styles from "./page.module.css"

export default function Loading() {
    const b: string = `
        no-repeat linear-gradient(#cacaca 0 0) 0%   50%,
        no-repeat linear-gradient(#cacaca 0 0) 50%  50%,
        no-repeat linear-gradient(#cacaca 0 0) 100% 50%
    `

    return (
        <div className={styles.loader} style={{background: b}}></div>
    )
}