import { dbGetBusinessEarningsByBusiness, dbGetBusinessesByCongregation, dbGetBusinessesByOwner, dbGetCongregationsByOwner, dbGetWorkersByBusinessId } from "@/app/db/query"
import { Business, BusinessEarningComponents, BusinessEarnings, Congregation, GenericError, Worker } from "../types"
import { businessesToSlugs, calculateBaseEarningRate, calculateEarningRate, timeSince, workersToSlugs } from "../tools"
import { FieldPacket, QueryError, QueryResult } from "mysql2"

// The below functions DO NOT PROVIDE THEIR OWN AUTH, they assume auth completion; these are server-side utilities only!!!!!!

// business earning components for a business
export async function getBusinessEarningData(business: Business): Promise<BusinessEarningComponents | GenericError> {
    const workersResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetWorkersByBusinessId(business.business_id)

    if ((workersResult as QueryError).code !== undefined) {
        console.log(workersResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Failed Business Workers Fetch From Database)' }
    }

    const workers: Worker[] = (workersResult as [Worker[], FieldPacket[]])[0]

    const baseEarningRate: number = calculateBaseEarningRate(businessesToSlugs([business])[0], workersToSlugs(workers))

    const businessEarningsResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetBusinessEarningsByBusiness(business.business_id)

    if ((businessEarningsResult as QueryError).code !== undefined || (businessEarningsResult as [BusinessEarnings[], FieldPacket[]])[0].length === 0) {
        console.log(businessEarningsResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find Business Earnings)' }
    }

    const businessEarnings: BusinessEarnings = (businessEarningsResult as [BusinessEarnings[], FieldPacket[]])[0][0]

    const lastUpdateInSeconds: number = timeSince(new Date(businessEarnings.last_update))
    const businessUncollectedEarnings: number = Number(businessEarnings.last_earning)

    return {
        baseEarningRate: baseEarningRate,
        uncollectedEarnings: businessUncollectedEarnings,
        timeSinceLastUpdate: lastUpdateInSeconds
    }
}

// business earning components for all of an owner's (user's) businesses
export async function getAllOwnersBusinessesEarningData(username: string): Promise<BusinessEarningComponents[] | GenericError> {
    const businessCheckResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetBusinessesByOwner(username)

    if ((businessCheckResult as QueryError).code !== undefined) {
        console.log(businessCheckResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Failed To Fetch Businesses From Database)' }
    }

    const businesses: Business[] = (businessCheckResult as [Business[], FieldPacket[]])[0]
    const results: BusinessEarningComponents[] = []

    for (const business of businesses) {
        const result: BusinessEarningComponents | GenericError = await getBusinessEarningData(business)

        if ((result as GenericError).error !== undefined)
            return result as GenericError

        results.push(result as BusinessEarningComponents)
    }

    return results
}

// business earning components for all businesses of a congregation
export async function getAllCongregationsBusinessesEarningData(congregationId: string): Promise<BusinessEarningComponents[] | GenericError> {
    const businessCheckResult: [QueryResult, FieldPacket[]] | GenericError = await dbGetBusinessesByCongregation(congregationId)

    if ((businessCheckResult as GenericError).error !== undefined) {
        console.log(businessCheckResult)
        return businessCheckResult as GenericError
    }

    const businesses: Business[] = (businessCheckResult as [Business[], FieldPacket[]])[0]
    const results: BusinessEarningComponents[] = []

    for (const business of businesses) {
        const result: BusinessEarningComponents | GenericError = await getBusinessEarningData(business)

        if ((result as GenericError).error)
            return result as GenericError

        results.push(result as BusinessEarningComponents)
    }

    return results
}

// business earning components for all businesses of all of an owner's (user's) congregations
export async function getAllCongregationOwnersBusinessesEarningData(username: string): Promise<BusinessEarningComponents[] | GenericError> {
    const congregationCheckResult: [QueryResult, FieldPacket[]] | GenericError = await dbGetCongregationsByOwner(username)

    if ((congregationCheckResult as GenericError).error !== undefined) {
        console.log(congregationCheckResult)
        return congregationCheckResult as GenericError
    }

    const congregations: Congregation[] = (congregationCheckResult as [Congregation[], FieldPacket[]])[0]
    const results: BusinessEarningComponents[] = []

    for (const congregation of congregations) {
        const result: BusinessEarningComponents[] | GenericError = await getAllCongregationsBusinessesEarningData(congregation.congregation_id)

        if ((result as GenericError).error)
            return result as GenericError

        results.push(...result as BusinessEarningComponents[])
    }

    return results
}