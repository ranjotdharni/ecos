import { CITY_ICON, SETTLEMENT_ICON } from "@/customs/utils/constants"
import { CongregationType } from "@/customs/utils/types"

export const CONGREGATION_TYPES: CongregationType[] = [
    {
        type: 0,
        title: 'Settlement',
        icon: SETTLEMENT_ICON
    },
    {
        type: 1,
        title: 'City',
        icon: CITY_ICON
    }
]