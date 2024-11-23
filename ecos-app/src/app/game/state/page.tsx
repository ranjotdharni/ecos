import StateContent from "@/app/components/state/page/StateContent"
import StateHeader from "@/app/components/state/page/StateHeader"
import styles from "./page.module.css"

export default function State() {

    return (
        <section className={styles.page}>
            <StateHeader />
            <StateContent />
        </section>
    )
}