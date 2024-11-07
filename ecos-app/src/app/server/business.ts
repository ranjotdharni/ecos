import { FOOD_SERVICE_ICON, MEDICINE_ICON, MILITARY_ICON, CONSTRUCTION_ICON, RELIGIOUS_ICON, RESIDENTIAL_ICON } from "@/customs/utils/constants"
import { BusinessType } from "@/customs/utils/types"

export const NEW_BUSINESS_COST: number = 200
export const MIN_BASE_EARNING_RATE: number = 0.03
export const MAX_BASE_EARNING_RATE: number = 0.05

// MAY NOT RETURN EMPTY STRING!!!!
export async function validateBusinessName(name: string): Promise<string | void> {
    if (name.length < 2) 
        return 'Name must be at least 2 characters'

    if (name.length > 32)
        return 'Name may be at most 32 characters'
}

// MAY NOT RETURN EMPTY STRING!!!!
export async function validateBusinessRankIncrease(rank: string): Promise<string | void> {
    if (rank.indexOf(' ') >= 0 || isNaN(Number(rank))) 
        return 'Invalid Rank Increase'

    if (Number(rank) < 0)
        return 'Rank Increase cannot be negative'
}

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