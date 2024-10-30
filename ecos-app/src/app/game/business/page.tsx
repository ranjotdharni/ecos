import BusinessHeader from "@/app/components/business/page/BusinessHeader"
import styles from "./page.module.css"
import BusinessContent from "@/app/components/business/page/BusinessContent"

export default function Business() {

    return (
        <section className={styles.page}>
            <BusinessHeader />
            <BusinessContent />
        </section>
    )
}