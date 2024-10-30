import { FOOD_SERVICE_ICON, MEDICINE_ICON, MILITARY_ICON, CONSTRUCTION_ICON, RELIGIOUS_ICON, RESIDENTIAL_ICON } from "@/customs/utils/constants"
import { BusinessType } from "@/customs/utils/types"

export const NEW_BUSINESS_COST: number = 250000

export const BUSINESS_TYPES: BusinessType[] = [
    {
        type: 1,
        title: 'Food Service',
        icon: FOOD_SERVICE_ICON
    },
    {
        type: 2,
        title: 'Military',
        icon: MILITARY_ICON
    },
    {
        type: 3,
        title: 'Residential',
        icon: RESIDENTIAL_ICON
    },
    {
        type: 4,
        title: 'Religious',
        icon: RELIGIOUS_ICON
    },
    {
        type: 5,
        title: 'Medicine',
        icon: MEDICINE_ICON
    },
    {
        type: 6,
        title: 'Construction',
        icon: CONSTRUCTION_ICON
    }
]