

// convert a date object to database formatted string
export function dateToSQLDate(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ')
}

// calculate worker wage (per second)
export function calculateWage(baseEarningRate: number, rankMultiplier: number, workerCount: number, workerRank: number, laborSplit: number): number {
    return (baseEarningRate * (3 + workerCount)) * (laborSplit + (rankMultiplier * workerRank))
}