
export const NEW_STATE_COST: number = 1000000000
export const MINIMUM_CONGREGATIONS_PER_STATE: number = 10

// MAY NOT RETURN EMPTY STRING!!!!
export async function validateStateName(name: string): Promise<string | void> {
    if (name.length < 2) 
        return 'State Name must be at least 2 characters'

    if (name.length > 32)
        return 'State Name may be at most 32 characters'
}

// MAY NOT RETURN EMPTY STRING!!!!
export async function validateStateTax(tax: string): Promise<string | void> {
    if (tax.indexOf(' ') >= 0 || isNaN(Number(tax))) 
        return 'Invalid Tax Rate'

    if (Number(tax) < 0)
        return 'Tax Rate cannot be negative'
}