import { CITY_ICON, SETTLEMENT_ICON } from "@/customs/utils/constants"
import { CongregationType } from "@/customs/utils/types"

export const NEW_CONGREGATION_COST: number = 10000000

// MAY NOT RETURN EMPTY STRING!!!!
export async function validateCongregationName(name: string): Promise<string | void> {
    if (name.length < 2) 
        return 'Name must be at least 2 characters'

    if (name.length > 32)
        return 'Name may be at most 32 characters'
}

// MAY NOT RETURN EMPTY STRING!!!!
export async function validateCongregationLaborSplit(split: string): Promise<string | void> {
    if (split.indexOf(' ') >= 0 || isNaN(Number(split))) 
        return 'Invalid Rank Increase'

    if (Number(split) < 0)
        return 'Rank Increase cannot be negative'
}

// MAY NOT RETURN EMPTY STRING!!!!
export async function validateCongregationTaxRate(tax: string): Promise<string | void> {
    if (tax.indexOf(' ') >= 0 || isNaN(Number(tax))) 
        return 'Invalid Tax Rate'

    if (Number(tax) < 0)
        return 'Congregation Tax Rate cannot be negative'
}

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