import BusinessContent from "@/app/components/business/page/BusinessContent"
import BusinessHeader from "@/app/components/business/page/BusinessHeader"
import styles from "./page.module.css"

export default async function BusinessPage() {
    return (
        <section className={styles.page}>
            <BusinessHeader />
            <BusinessContent />
        </section>
    )
}