import NewStatePage from "@/app/components/state/new/NewStatePage"
import styles from "./page.module.css"

export default async function() {
    return (
        <section className={styles.page}>
            <NewStatePage />
        </section>
    )
}