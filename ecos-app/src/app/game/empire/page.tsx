import EmpireContent from "@/app/components/empire/EmpireContent"
import EmpireHeader from "@/app/components/empire/EmpireHeader"
import styles from "./page.module.css"

export default async function Empire() {

    return (
        <section className={styles.page}>
            <EmpireHeader />
            <EmpireContent />
        </section>
    )
}