import BusinessList from "@/app/components/job/new/BusinessList"
import styles from "./page.module.css"

export default async function NewJob() {
    return (
        <section className={styles.page}>
            <BusinessList />
        </section>
    )
}