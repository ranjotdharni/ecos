'use server'

import { dbGetUser, dbCreateUser, dbGenerateSession, dbSetEmpire, dbSelectJob, dbGetJobs, dbClockIn, dbClockOut, dbAddGold, dbCheckCongregationExists, dbNewBusiness, dbGetBusinessesByOwner, dbGetWorkersByBusinessId, dbGetBusinessEarningsByBusiness, dbUpdateBusinessEarnings, dbEditWorkerRank, dbFireWorker, dbGetStateById, dbCreateNewCongregation, dbGetUserById, dbAddCollectionEntry } from "../../app/db/query"
import { User, AuthFormSlug, GenericError, Worker, GenericSuccess, BusinessSlug, CongregationSlug, BusinessType, Business, BusinessEarnings, StateSlug, NewBusiness, State, WorkerSlug } from "@/customs/utils/types"
import { businessesToSlugs, calculateBaseEarningRate, calculateEarningRate, calculateTotalSplit, calculateWage, dateToSQLDate, getRandomDecimalInclusive, timeSince, workersToSlugs } from "@/customs/utils/tools"
import { API_BUSINESS_ROUTE, AUTH_ROUTE, DEFAULT_SUCCESS_ROUTE, MAX_CLOCK_TIME, MIN_CLOCK_REFRESH_TIME, NEW_EMPIRE_ROUTE, PASSWORD_SALT_ROUNDS, TOKEN_SALT_ROUNDS } from "../../customs/utils/constants"
import { BUSINESS_TYPES, MAX_BASE_EARNING_RATE, MIN_BASE_EARNING_RATE, NEW_BUSINESS_COST, validateBusinessName, validateBusinessRankIncrease, validateNewBusinessFields } from "@/app/server/business"
import { NEW_CONGREGATION_COST, validateCongregationLaborSplit, validateCongregationName, validateCongregationTaxRate } from "@/app/server/congregation"
import { generateAuthCookieOptions, generateSessionExpirationDate, validateName, validatePassword, validateUsername } from "@/app/server/auth"
import { FiredItem, RankChangeItem } from "@/app/components/business/id/WorkerModal"
import { FieldPacket, QueryError, QueryResult } from "mysql2"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { hash, compare } from "bcrypt"
import { v4 as uuidv4 } from "uuid"

// NOTE
// I used one of these functions in a client component so NextJS would not
// shut up about using a server component in a client component with a specific 
// import. So, I was basically forced to move this to this newly created file which
// I'm now using for server actions in general for client components.

// Submit credential authentication form handler
export async function userAuthenticate(isNewUser: boolean, details: AuthFormSlug, urlParams: { [key: string]: string | string[] | undefined }): Promise<string | void> {
    if (isNewUser) {    // create new user

        // validate name
        const invalidName: string | void = await validateName(details.firstname!, details.lastname!)

        if (invalidName) 
            return invalidName

        // validate username
        if (details.username === details.password)
            return 'Username may not match password'

        const invalidUsername: string | void = await validateUsername(details.username)

        if (invalidUsername)
            return invalidUsername

        // validate password
        if (details.password !== details.confirm) {
            return 'Passwords must match'
        }

        const invalidPassword: string | void = await validatePassword(details.password)

        if (invalidPassword)
            return invalidPassword

        // add user
        const hashPassword: string = await hash(details.password, PASSWORD_SALT_ROUNDS)
        let result: [QueryResult, FieldPacket[]] | QueryError = await dbCreateUser(uuidv4(), details.firstname!, details.lastname!, details.username, hashPassword, dateToSQLDate(new Date()))

        if ((result as QueryError).code !== undefined) 
            return 'User already exists'
    
    }
    else {  // log in existing user
        const result: [QueryResult, FieldPacket[]] | QueryError = await dbGetUser(details.username)

        if ((result as QueryError).code !== undefined) {
            console.log(result)
            return '500 Internal Server Error'
        }

        const credentials: User[] = (result as [User[], FieldPacket[]])[0]
        
        if (credentials.length === 0 || !await compare(details.password, credentials[0].password))
            return 'Username/Password not found'

    }

    // create session
    const session_expiration: Date = await generateSessionExpirationDate()
    const session_token: string = uuidv4() 
    const session_hash: string = await hash(`${session_token}${process.env.TOKEN_SECRET}`, TOKEN_SALT_ROUNDS)

    const result: [QueryResult, FieldPacket[]] | QueryError = await dbGenerateSession(details.username, session_hash, dateToSQLDate(session_expiration))    // automatically destroys any existing session(s)

    if ((result as QueryError).code !== undefined) {
        console.log(result)
        return '500 Internal Server Error'
    }

    // set session cookies
    const cookieList = cookies()
    const cookieOptions = await generateAuthCookieOptions(session_expiration)
    cookieList.set('username', details.username, cookieOptions)
    cookieList.set('token', session_token, cookieOptions)

    // determine if redirect route param was passed
    let nextRoute: string

    if (urlParams.next === undefined)
        nextRoute = (isNewUser ? NEW_EMPIRE_ROUTE : DEFAULT_SUCCESS_ROUTE)
    else if (Array.isArray(urlParams.next))
        nextRoute = (isNewUser ? `${NEW_EMPIRE_ROUTE}?next=${urlParams.next[0]}` : urlParams.next[0])
    else 
        nextRoute = (isNewUser ? `${NEW_EMPIRE_ROUTE}?next=${urlParams.next}` : urlParams.next)

    // redirect
    redirect(nextRoute)
}

// select empire
export async function selectEmpire(empire: number, urlParams: { [key: string]: string | string[] | undefined }): Promise<string | void> {
    const cookieList = cookies()

    if (!cookieList.has('username'))
        redirect(AUTH_ROUTE)

    const username: string = cookieList.get('username')!.value

    let result: [QueryResult, FieldPacket[]] | QueryError = await dbGetUser(username)

    if ((result as QueryError).code !== undefined) {    // ISE when getting user info
        console.log(result)
        return '500 Internal Server Error'
    }

    const user: User[] = (result as [User[], FieldPacket[]])[0]

    if (user.length === 0)
        return 'User Not Found'

    if (user[0].empire !== null)
        return 'Empire Already Selected'

    result = await dbSetEmpire(username, empire)

    if ((result as QueryError).code !== undefined) {
        console.log(result)
        return '500 Internal Server Error'
    }

    // determine if redirect route param was passed
    let nextRoute: string

    if (urlParams.next === undefined)
        nextRoute = DEFAULT_SUCCESS_ROUTE
    else if (Array.isArray(urlParams.next))
        nextRoute = urlParams.next[0]
    else 
        nextRoute = urlParams.next

    // redirect
    redirect(nextRoute)
}

export async function selectJob(businessId: string): Promise<string | GenericError> {
    const cookieList = cookies()

    if (!cookieList.has('username'))
        redirect(AUTH_ROUTE)

    const username: string = cookieList.get('username')!.value
    const workerId: string = uuidv4()

    const result: [Worker[], FieldPacket[]] | QueryError = await dbGetJobs(username)

    if ((result as QueryError).code !== undefined) {
        console.log(result)
        return { error: true, message: '500 INTERNAL SERVER ERROR' }
    }

    if ((result as [Worker[], FieldPacket[]])[0].length !== 0) {
        return { error: true, message: 'You cannot hold another job' }
    }

    const response: [QueryResult, FieldPacket[]] | QueryError = await dbSelectJob(workerId, username, businessId)

    if ((response as QueryError).code !== undefined) {
        console.log(response)
        return { error: true, message: '500 INTERNAL SERVER ERROR' }
    }

    return 'Job Selected'   // success, return string
}

export async function clockIn(job: Worker): Promise<GenericSuccess | GenericError> {
    if (job.clocked_in === null) {
        const response: [QueryResult, FieldPacket[]] | QueryError = await dbClockIn(new Date(), job.worker_id)

        if ((response as QueryError).code !== undefined) {
            console.log(response)
            return { error: true, message: '500 INTERNAL SERVER ERROR' }
        }

        return { success: true, message: 'Clocked In' }
    }
    if (job.clocked_out !== null && timeSince(job.clocked_out) < MIN_CLOCK_REFRESH_TIME) {
        return { error: true, message: 'Too early to clock in right now' }
    }

    const response: [QueryResult, FieldPacket[]] | QueryError = await dbClockIn(new Date(), job.worker_id)

    if ((response as QueryError).code !== undefined) {
        console.log(response)
        return { error: true, message: '500 INTERNAL SERVER ERROR' }
    }

    return { success: true, message: 'Clocked In' }
}

export async function clockOut(job: Worker, wage: number): Promise<GenericSuccess | GenericError> {
    const time: Date = new Date()

    let response: [QueryResult, FieldPacket[]] | QueryError = await dbClockOut(time, job.worker_id)

    if ((response as QueryError).code !== undefined) {
        console.log(response)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Failed Clock)' }
    }

    response = await dbAddGold(job.user_id, wage * Math.min(MAX_CLOCK_TIME, timeSince(job.clocked_in!, time)))

    if ((response as QueryError).code !== undefined) {
        console.log(response)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Failed Gold Update)' }
    }

    return { success: true, message: 'Clocked Out' }
}

export async function clockInOut(): Promise<GenericSuccess | GenericError> {
    const cookieList = cookies()

    if (!cookieList.has('username'))
        redirect(AUTH_ROUTE)

    const username: string = cookieList.get('username')!.value

    const jobResponse: [Worker[], FieldPacket[]] | QueryError = await dbGetJobs(username)

    if ((jobResponse as QueryError).code !== undefined || (jobResponse as [Worker[], FieldPacket[]])[0].length === 0) {
        console.log(jobResponse)
        return { error: true, message: '500 INTERNAL SERVER ERROR' }
    }

    const job: Worker = (jobResponse as [Worker[], FieldPacket[]])[0][0]

    if (job.clocked_in === null) {  // clock in  
        return await clockIn(job)
    }
    else if (job.clocked_out === null || job.clocked_in > job.clocked_out) {    // clock out
        const business: BusinessSlug = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_BUSINESS_ROUTE}`, {     // fetch business data of user's job
            method: 'POST',
            body: JSON.stringify({
                businessId: job.business_id
            })
        }).then(async response => {
            return await response.json()
        }).then(response => {
            return response.businesses[0]
        })
        return await clockOut(job, calculateWage(business.base_earning_rate, business.rank_earning_increase, business.worker_count, job.worker_rank, business.congregation.labor_split))
    }
    else {  // clock in
        return await clockIn(job)
    }
}

export async function purchaseBusiness(name: string, rank: string, type: BusinessType, congregation: CongregationSlug): Promise<GenericSuccess | GenericError> {
    const invalidBusinessName = await validateBusinessName(name)
    const invalidRankIncrease = await validateBusinessRankIncrease(rank)

    if (invalidBusinessName)
        return { error: true, message: invalidBusinessName }

    if (invalidRankIncrease)
        return { error: true, message: invalidRankIncrease }

    if (BUSINESS_TYPES.find(b => b.icon === type.icon && b.title === type.title && b.type === type.type) === undefined)
        return { error: true, message: 'Invalid Business Type' }

    let result: [QueryResult, FieldPacket[]] | QueryError = await dbCheckCongregationExists(congregation)

    if ((result as QueryError).code !== undefined || (result as [User[], FieldPacket[]])[0].length === 0) {    // ISE when getting congregation info
        console.log(result)
        return { error: true, message: 'Selected Congregation Not Found' }
    }

    const cookieList = cookies()

    if (!cookieList.has('username'))
        redirect(AUTH_ROUTE)

    const username: string = cookieList.get('username')!.value

    result = await dbGetUser(username)

    if ((result as QueryError).code !== undefined) {    // ISE when getting user info
        console.log(result)
        return { error: true, message: '500 Internal Server Error' }
    }

    const users: User[] = (result as [User[], FieldPacket[]])[0]

    if (users.length === 0)
        return { error: true, message: '500 Internal Server Error' }

    const user: User = users[0]

    if (congregation.empire !== user.empire || congregation.state.empire !== user.empire)
        return { error: true, message: 'New Business must be in your Empire' }

    if (user.gold < NEW_BUSINESS_COST)
        return { error: true, message: 'You cannot afford a New Business' }

    result = await dbAddGold(user.user_id, -NEW_BUSINESS_COST)

    if ((result as QueryError).code !== undefined) {
        console.log(result)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Failed Gold Update)' }
    }

    result = await dbNewBusiness(uuidv4(), congregation.congregation_id, user.user_id, name, type.type, getRandomDecimalInclusive(MIN_BASE_EARNING_RATE, MAX_BASE_EARNING_RATE), rank, 1, uuidv4(), new Date())

    if ((result as QueryError).code !== undefined) {
        console.log(result)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Failed Purchase Update)' }
    }

    return { success: true, message: 'Business Purchased' }
}

export async function collectBusinessEarnings(businessId: string): Promise<GenericSuccess | GenericError> {
    const cookieList = cookies()

    if (!cookieList.has('username'))
        redirect(AUTH_ROUTE)

    const username: string = cookieList.get('username')!.value

    const userResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetUser(username)

    if ((userResult as QueryError).code !== undefined || (userResult as [User[], FieldPacket[]])[0].length === 0) {
        console.log(userResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find User)' }
    }

    const user: User = (userResult as [User[], FieldPacket[]])[0][0]

    const ownerCheckResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetBusinessesByOwner(user.username)

    if ((ownerCheckResult as QueryError).code !== undefined) {
        console.log(ownerCheckResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find Business)' }
    }

    const ownerCheck: Business[] = (ownerCheckResult as [Business[], FieldPacket[]])[0]

    const business: Business | undefined = ownerCheck.find(b => b.business_id === businessId)

    if (business === undefined)
        return { error: true, message: 'You do not own this business' }

    const workersResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetWorkersByBusinessId(business.business_id)

    if ((workersResult as QueryError).code !== undefined) {
        console.log(workersResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find Business Workers)' }
    }

    const workers: Worker[] = (workersResult as [Worker[], FieldPacket[]])[0]

    const congregationOwnerResult: [User[], FieldPacket[]] | GenericError = await dbGetUserById(business.congregation_owner_id as string)

    if ((congregationOwnerResult as GenericError).error !== undefined || (congregationOwnerResult as [User[], FieldPacket[]])[0].length === 0) {
        console.log(congregationOwnerResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Could Not Find Congregation Owner)' }
    }

    const stateOwnerResult: [User[], FieldPacket[]] | GenericError = await dbGetUserById(business.state_owner_id as string)

    if ((stateOwnerResult as GenericError).error !== undefined || (stateOwnerResult as [User[], FieldPacket[]])[0].length === 0) {
        console.log(stateOwnerResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Could Not Find State Owner)' }
    }

    const stateOwner: User = (stateOwnerResult as [User[], FieldPacket[]])[0][0]

    const congregationOwner: User = (congregationOwnerResult as [User[], FieldPacket[]])[0][0]

    const workerSlugs: WorkerSlug[] = workersToSlugs(workers)

    const baseEarningRate: number = calculateBaseEarningRate(businessesToSlugs([business])[0], workerSlugs)

    const businessEarningRate: number = calculateEarningRate(businessesToSlugs([business])[0], workerSlugs)

    const businessEarningsResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetBusinessEarningsByBusiness(business.business_id)

    if ((businessEarningsResult as QueryError).code !== undefined || (businessEarningsResult as [BusinessEarnings[], FieldPacket[]])[0].length === 0) {
        console.log(businessEarningsResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find Business Earnings)' }
    }

    const businessEarnings: BusinessEarnings = (businessEarningsResult as [BusinessEarnings[], FieldPacket[]])[0][0]

    const date: Date = new Date()
    const time: number = timeSince(new Date(businessEarnings.last_update), date)
    const uncollectedEarnings: number = Number(businessEarnings.last_earning)

    const revenue: number = uncollectedEarnings + (baseEarningRate * time)
    const earned: number = uncollectedEarnings + (businessEarningRate * time)
    const congregationCut: number = revenue * Number(business.congregation_tax_rate)
    const stateCut: number = revenue * Number(business.state_tax_rate)

    let goldUpdate: [QueryResult, FieldPacket[]] | QueryError = await dbAddGold(user.user_id, earned)

    if ((goldUpdate as QueryError).code !== undefined) {
        console.log(goldUpdate)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Could Not Update User Gold)' }
    }

    goldUpdate = await dbAddGold(stateOwner.user_id, stateCut)

    if ((goldUpdate as QueryError).code !== undefined) {
        console.log(goldUpdate)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Could Not Update State Owner Gold)' }
    }

    goldUpdate = await dbAddGold(congregationOwner.user_id, congregationCut)

    if ((goldUpdate as QueryError).code !== undefined) {
        console.log(goldUpdate)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Could Not Update Congregation Owner Gold)' }
    }

    const earningsUpdate: [QueryResult, FieldPacket[]] | QueryError = await dbUpdateBusinessEarnings(user.username, business.business_id, 0, date)

    if ((earningsUpdate as QueryError).code !== undefined) {
        console.log(earningsUpdate)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Could Not Update Earnings)' }
    }

    const collectionsUpdate: [QueryResult, FieldPacket[]] | GenericError = await dbAddCollectionEntry(uuidv4(), business.business_id, Number(business.state_tax_rate), Number(business.congregation_tax_rate), calculateTotalSplit(workerSlugs), date, revenue)

    if ((collectionsUpdate as GenericError).error !== undefined) {
        console.log(collectionsUpdate)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Could Not Update Collections)' }
    }

    return { success: true, message: 'Collected Earnings' }
}

export async function editWorkers(businessId: string, changedRanks: RankChangeItem[], firedWorkers: FiredItem[]): Promise<GenericSuccess | GenericError> {
    const cookieList = cookies()

    if (!cookieList.has('username'))
        redirect(AUTH_ROUTE)

    const username: string = cookieList.get('username')!.value

    const userResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetUser(username)

    if ((userResult as QueryError).code !== undefined || (userResult as [User[], FieldPacket[]])[0].length === 0) {
        console.log(userResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find User)' }
    }

    const user: User = (userResult as [User[], FieldPacket[]])[0][0]

    const ownerCheckResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetBusinessesByOwner(user.username)

    if ((ownerCheckResult as QueryError).code !== undefined) {
        console.log(ownerCheckResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find Business)' }
    }

    const ownerCheck: Business[] = (ownerCheckResult as [Business[], FieldPacket[]])[0]

    if (ownerCheck.length === 0 || ownerCheck.find(b => b.business_id === businessId) === undefined)
        return { error: true, message: 'You do not own this business' }

    const business: Business = ownerCheck.find(b => b.business_id === businessId)!

    for (const update of changedRanks) {
        const editRank: [QueryResult, FieldPacket[]] | QueryError = await dbEditWorkerRank(update.workerId, update.rank)

        if ((editRank as QueryError).code !== undefined) {
            console.log(editRank)
            return { error: true, message: '500 INTERNAL SERVER ERROR (Failed Rank Update)' }
        }
    }

    for (const update of firedWorkers) {
        const editRank: [QueryResult, FieldPacket[]] | QueryError = await dbFireWorker(update.workerId)

        if ((editRank as QueryError).code !== undefined) {
            console.log(editRank)
            return { error: true, message: '500 INTERNAL SERVER ERROR (Failed To Fire Workers)' }
        }
    }

    return { success: true, message: 'Updated Workers' }
}

export async function createNewCongregation(stateSlug: StateSlug, name: string, taxRate: string, split: string, newBusinesses: NewBusiness[]): Promise<GenericSuccess | GenericError> {
    if (newBusinesses.length !== 3)
        return { error: true, message: 'New congregations must have 3 businesses' }

    const cookieList = cookies()

    if (!cookieList.has('username'))
        redirect(AUTH_ROUTE)

    const username: string = cookieList.get('username')!.value

    const userResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetUser(username)

    if ((userResult as QueryError).code !== undefined || (userResult as [User[], FieldPacket[]])[0].length === 0) {
        console.log(userResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find User)' }
    }

    const user: User = (userResult as [User[], FieldPacket[]])[0][0]

    if (Number(user.gold) < NEW_CONGREGATION_COST)
        return { error: true, message: 'You cannot afford a congregation' }

    const stateResult: [State[], FieldPacket[]] | GenericError = await dbGetStateById(stateSlug.state_id)

    if ((stateResult as GenericError).error !== undefined) {
        console.log((stateResult as GenericError).message)
        return stateResult as GenericError
    }

    const state: State = (stateResult as [State[], FieldPacket[]])[0][0]

    if (Number(user.empire) !== Number(state.empire))
        return { error: true, message: "Your congregation's state must be in your empire" }

    const validName: string | void = await validateCongregationName(name)
    const validTaxRate: string | void = await validateCongregationTaxRate(taxRate)
    const validSplit: string | void = await validateCongregationLaborSplit(split)

    if (validName)
        return { error: true, message: validName }
    if (validTaxRate)
        return { error: true, message: validTaxRate }
    if (validSplit)
        return { error: true, message: validSplit }

    for (const slug of newBusinesses) {
        const notValid: string | void = await validateNewBusinessFields(slug)
        if (notValid)
            return { error: true, message: notValid }
    }

    const purchaseResult: [QueryResult, FieldPacket[]] | QueryError = await dbAddGold(user.user_id, -NEW_CONGREGATION_COST)

    if ((purchaseResult as QueryError).code !== undefined) {
        console.log(purchaseResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Failed Gold Update)' }
    }

    const congregationId: string = uuidv4()
    const createdAt: Date = new Date()
    const congregationResult: [QueryResult, FieldPacket[]] | GenericError = await dbCreateNewCongregation(congregationId, Number(user.empire), state.state_id, user.user_id, name, split, 0, Number(taxRate), uuidv4(), createdAt)

    if ((congregationResult as GenericError).error !== undefined) {
        console.log((congregationResult as GenericError).message)
        return congregationResult as GenericError
    }

    for (const business of newBusinesses) {
        const businessResult: [QueryResult, FieldPacket[]] | QueryError = await dbNewBusiness(uuidv4(), congregationId, user.user_id, business.name, business.businessType, getRandomDecimalInclusive(MIN_BASE_EARNING_RATE, MAX_BASE_EARNING_RATE), business.rank, 1, uuidv4(), createdAt)

        if ((businessResult as QueryError).code !== undefined) {
            console.log(businessResult)
            return { error: true, message: '500 INTERNAL SERVER ERROR (Failed To Create Businesses)' }
        }
    }

    return { success: true, message: 'New Congregation Purchased' }
}