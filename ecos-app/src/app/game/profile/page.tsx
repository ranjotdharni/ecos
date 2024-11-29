import ProfilePageOrchestrator from "@/app/components/profile/ProfilePageOrchestrator"
import styles from "./page.module.css"

export default async function ProfilePage() {

    return (
        <section className={styles.page}>
            <ProfilePageOrchestrator />
        </section>
    )
}