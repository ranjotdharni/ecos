import JobModule from "@/app/components/job/page/Job"
import styles from "./page.module.css"

export default function Job() {

    return (
        <section className={styles.page}>
            <JobModule />
        </section>
    )
}