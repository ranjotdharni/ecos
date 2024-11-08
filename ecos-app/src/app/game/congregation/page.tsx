import CongregationContent from "@/app/components/congregation/page/CongregationContent"
import CongregationHeader from "@/app/components/congregation/page/CongregationHeader"
import styles from "./page.module.css"

export default function Congregation() {

    return (
        <section className={styles.page}>
            <CongregationHeader />
            <CongregationContent />
        </section>
    )
}