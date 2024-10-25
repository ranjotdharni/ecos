import { BUSINESS_ICON, CONGREGATION_ICON, CROWN_ICON, GAME_ICON, JOB_ICON } from "@/customs/utils/constants"
import styles from "./page.module.css"

function ContentCard({ icon, text } : { icon: string, text: string }) {
  return (
    <div className={styles.card}>
      <img src={icon} />
      <p>{text}</p>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.title}>
          <img src={GAME_ICON} />
          <h1>Hegemony</h1>
        </div>
        <div className={styles.nav}>
          <a href='/game/home'>Home</a>
          <a href='/welcome'>Login</a>
          <a href='https://github.com/ranjotdharni/ecos'>About</a>
          <a href='/'>Contact</a>
        </div>
      </div>
      <section className={styles.page}>
        <div className={styles.content}>
          <ContentCard icon={CROWN_ICON} text='Select an empire to build wealth in and make your future fortune. Represent your country by working to help grow its economy.' />
          <ContentCard icon={JOB_ICON} text='Work your job of choice in a fantasy world. Accumulate your newfound wealth by working along with other real-world players.' />
          <ContentCard icon={BUSINESS_ICON} text="Save up your gold to start your own businesses. Make money more steadily even while you're immediately logged off of Hegemony." />
          <ContentCard icon={CONGREGATION_ICON} text='Start your own settlements and slowly grow them into prosperous cities. Form your cities into states under your control.' />
        </div>
        <div className={styles.buttons}>
          <a href='/welcome?newUser=true'>Play</a>
        </div>
      </section>
    </>
  )
}
