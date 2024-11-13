import { CITY_ICON, SETTLEMENT_ICON } from "@/customs/utils/constants"
import { CongregationType } from "@/customs/utils/types"

export const NEW_CONGREGATION_COST: number = 10000000

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