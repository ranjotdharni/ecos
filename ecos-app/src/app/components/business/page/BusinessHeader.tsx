import { COIN_ICON } from "@/customs/utils/constants"
import styles from "./css/businessHeader.module.css"

export default function BusinessHeader() {

    return (
        <div className={styles.container}>
            <img src={COIN_ICON} />
            <h1>0.00</h1>
        </div>
    )
}