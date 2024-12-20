'use server'

import { dbGetUser, dbCreateUser, dbGenerateSession, dbSetEmpire, dbSelectJob, dbGetJobs, dbClockIn, dbClockOut, dbAddGold, dbCheckCongregationExists, dbNewBusiness, dbGetBusinessesByOwner, dbGetWorkersByBusinessId, dbGetBusinessEarningsByBusiness, dbUpdateBusinessEarnings, dbEditWorkerRank, dbFireWorker, dbGetStateById, dbCreateNewCongregation, dbGetUserById, dbAddCollectionEntry, dbGetCongregationById, dbSendInvite, dbInvitesToStateSlugs, dbDeleteInvite, dbGetInvitesByDetails, dbAcceptInvite, dbCreateState, dbUpdateCongregationsState, dbEditUserDetailsByUsername, dbSearchUsersByUsername, dbSendFriendRequest, dbDeleteRequest, dbMakeFriends, dbGetFriendsByDetails, dbDeleteFriends, dbGetBusinessById, dbUpdateCongregationStatus, dbGetUserByWorkerId } from "../../app/db/query"
import { User, AuthFormSlug, GenericError, Worker, GenericSuccess, BusinessSlug, CongregationSlug, BusinessType, Business, BusinessEarnings, StateSlug, NewBusiness, State, WorkerSlug, Congregation, Invite, StateInvite, ProfileType, UserDetails, RequestSlug, Friend } from "@/customs/utils/types"
import { businessesToSlugs, calculateBaseEarningRate, calculateEarningRate, calculateTotalSplit, calculateWage, dateToSQLDate, getRandomDecimalInclusive, timeSince, usersToSlugs, workersToSlugs } from "@/customs/utils/tools"
import { API_BUSINESS_ROUTE, AUTH_ROUTE, DEFAULT_SUCCESS_ROUTE, MAX_CLOCK_TIME, MIN_CLOCK_REFRESH_TIME, NEW_EMPIRE_ROUTE, PASSWORD_SALT_ROUNDS, TOKEN_SALT_ROUNDS } from "../../customs/utils/constants"
import { BUSINESS_TYPES, MAX_BASE_EARNING_RATE, MIN_BASE_EARNING_RATE, NEW_BUSINESS_COST, validateBusinessName, validateBusinessRankIncrease, validateNewBusinessFields } from "@/app/server/business"
import { CITY_CODE, NEW_CONGREGATION_COST, validateCongregationLaborSplit, validateCongregationName, validateCongregationTaxRate } from "@/app/server/congregation"
import { generateAuthCookieOptions, generateSessionExpirationDate, validateBio, validateName, validatePassword, validateUsername } from "@/app/server/auth"
import { MINIMUM_CONGREGATIONS_PER_STATE, NEW_STATE_COST, validateStateName, validateStateTax } from "@/app/server/state"
import { FiredItem, RankChangeItem } from "@/app/components/business/id/WorkerModal"
import { FieldPacket, QueryError, QueryResult } from "mysql2"
import { STATE_INVITE_CODE } from "@/app/server/invite"
import { PROFILE_DATA } from "@/app/server/profile"
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

    const hiringCheck: [Business[], FieldPacket[]] | QueryError = await dbGetBusinessById(businessId)

    if ((hiringCheck as QueryError).code !== undefined || (hiringCheck as [Business[], FieldPacket[]])[0].length === 0)
        return { error: true, message: 'Failed To Find Business' }

    const hiring: Business = (hiringCheck as [Business[], FieldPacket[]])[0][0]

    if (Number(hiring.hiring) === 0)
        return { error: true, message: 'This Business is not hiring' }

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

    const businessId: string = uuidv4()

    result = await dbNewBusiness(businessId, congregation.congregation_id, user.user_id, name, type.type, getRandomDecimalInclusive(MIN_BASE_EARNING_RATE, MAX_BASE_EARNING_RATE), rank, 1, uuidv4(), new Date())

    if ((result as QueryError).code !== undefined) {
        console.log(result)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Failed Purchase Update)' }
    }

    const congregationUpdate = await dbUpdateCongregationStatus(congregation.congregation_id)

    if ((congregationUpdate as GenericError).error !== undefined)
        return congregationUpdate as GenericError

    return { success: true, message: businessId }
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

    return { success: true, message: congregationId }
}

export async function sendStateInvite(i_to: string, i_from?: string): Promise<GenericSuccess | GenericError> {
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

    const congregationResult: GenericError | [Congregation[], FieldPacket[]] = await dbGetCongregationById(i_to)

    if ((congregationResult as GenericError).error !== undefined)
        return congregationResult as GenericError

    const congregation: Congregation = (congregationResult as [Congregation[], FieldPacket[]])[0][0]

    const toUserResult: [QueryResult, FieldPacket[]] | GenericError = await dbGetUserById(congregation.congregation_owner_id!)

    if ((toUserResult as GenericError).error !== undefined || (toUserResult as [User[], FieldPacket[]])[0].length === 0) {
        console.log(toUserResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find To User)' }
    }

    const toUser: User = (toUserResult as [User[], FieldPacket[]])[0][0]

    if (user.user_id === toUser.user_id)
        return { error: true, message: "You may not send an invite to yourself" }

    if (congregation.congregation_owner_id !== toUser.user_id)
        return { error: true, message: "The receipient of the invite doesn't own the Congregation" }

    if (i_from !== undefined) {
        const stateResult: [State[], FieldPacket[]] | GenericError = await dbGetStateById(i_from)

        if ((stateResult as GenericError).error !== undefined)
            return stateResult as GenericError

        const state: State = (stateResult as [State[], FieldPacket[]])[0][0]

        if (state.state_owner_id !== user.user_id)
            return { error: true, message: 'You do not own this State.' }
    }

    const invite: [QueryResult, FieldPacket[]] | GenericError = await dbSendInvite(user.user_id, toUser.user_id, congregation.congregation_id, STATE_INVITE_CODE, new Date(), i_from)

    if ((invite as GenericError).error !== undefined)
        return invite as GenericError

    return { success: true, message: `Invite sent to User ${toUser.username}` }
}

export async function invitesToSlugs(invites: Invite[]): Promise<(StateInvite)[] | GenericError> {
    const allInvites: (StateInvite)[] = []
    const stateInvites: Invite[] = []

    for (const invite of invites) {
        if (Number(invite.invite_type) === STATE_INVITE_CODE) {
            stateInvites.push(invite)
        }
    }

    const stateInviteSlugs: StateInvite[] | GenericError = await dbInvitesToStateSlugs(stateInvites, STATE_INVITE_CODE)

    if ((stateInviteSlugs as GenericError).error !== undefined)
        return stateInviteSlugs as GenericError

    allInvites.push.apply(allInvites, stateInviteSlugs as StateInvite[])

    return allInvites
}

export async function deleteInvite(invite: StateInvite): Promise<GenericSuccess | GenericError> {
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

    if (user.user_id !== invite.user_from.id && user.user_id !== invite.user_to.id)
        return { error: true, message: 'You do not have permission to decline this invite' }

    let result: [QueryResult, FieldPacket[]] | GenericError

    if (Number(invite.type) === STATE_INVITE_CODE) {
        const inviteCheck = await dbGetInvitesByDetails(invite.user_from.id, invite.user_to.id, invite.to.congregation_id, STATE_INVITE_CODE)

        if 
        (
            (inviteCheck as GenericError).error !== undefined || 
            (inviteCheck as [Invite[], FieldPacket[]])[0].length === 0
        )
            return { error: true, message: 'Could not find invite' } as GenericError

        result = await dbDeleteInvite(invite.user_from.id, invite.user_to.id, invite.to.congregation_id, STATE_INVITE_CODE)
    }
    else {
        // MODIFY THIS AS THIS FUNCTION GROWS!!!!!!!!!!!!!!!!!!!
        result = await dbDeleteInvite(invite.user_from.id, invite.user_to.id, invite.to.congregation_id, STATE_INVITE_CODE)
    }

    if ((result as GenericError).error !== undefined)
        return result as GenericError

    return { success: true, message: 'Invite Declined' }
}

export async function acceptInvite(invite: StateInvite): Promise<GenericSuccess | GenericError> {
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

    if (user.user_id !== invite.user_to.id)
        return { error: true, message: 'You do not have permission to accept this invite' }

    let result: [QueryResult, FieldPacket[]] | GenericError

    if (Number(invite.type) === STATE_INVITE_CODE) {
        const inviteCheck = await dbGetInvitesByDetails(invite.user_from.id, invite.user_to.id, invite.to.congregation_id, STATE_INVITE_CODE)

        if 
        (
            (inviteCheck as GenericError).error !== undefined || 
            (inviteCheck as [Invite[], FieldPacket[]])[0].length === 0
        )
            return { error: true, message: 'Could not find invite' } as GenericError

        result = await dbAcceptInvite(invite.user_from.id, invite.user_to.id, invite.to.congregation_id, STATE_INVITE_CODE)
    }
    else {
        // MODIFY THIS AS THIS FUNCTION GROWS!!!!!!!!!!!!!!!!!!!
        result = await dbAcceptInvite(invite.user_from.id, invite.user_to.id, invite.to.congregation_id, STATE_INVITE_CODE)
    }

    if ((result as GenericError).error !== undefined)
        return result as GenericError

    return { success: true, message: 'Invite Accepted' }
}

export async function makeNewState(name: string, taxRate: string, congregationList: CongregationSlug[], inviteList: StateInvite[]): Promise<GenericSuccess | GenericError> {
    if (congregationList.length + inviteList.length < MINIMUM_CONGREGATIONS_PER_STATE || congregationList.filter(c => Number(c.congregation_status) === CITY_CODE).length + inviteList.filter(i => Number(i.to.congregation_status) === CITY_CODE).length < MINIMUM_CONGREGATIONS_PER_STATE)
        return { error: true, message: 'Each state must have at least 10 Cities' }

    const validName: string | void = await validateStateName(name)
    const validTaxRate: string | void = await validateStateTax(taxRate)

    if (validName)
        return { error: true, message: validName }
    if (validTaxRate)
        return { error: true, message: validTaxRate }

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

    for (const congregation of congregationList) {
        const checkResult: GenericError | [Congregation[], FieldPacket[]] = await dbGetCongregationById(congregation.congregation_id)

        if ((checkResult as GenericError).error !== undefined || (checkResult as [Congregation[], FieldPacket[]])[0].length === 0 || (checkResult as [Congregation[], FieldPacket[]])[0][0].congregation_owner_id !== user.user_id)
            return { error: true, message: 'You do not own 1 or more of the selected Congregations' }
    }

    for (const invite of inviteList) {
        const checkResult: [Invite[], FieldPacket[]] | GenericError = await dbGetInvitesByDetails(user.user_id, invite.user_to.id, invite.to.congregation_id, STATE_INVITE_CODE)

        if ((checkResult as GenericError).error !== undefined || (checkResult as [Invite[], FieldPacket[]])[0].length === 0)
            return { error: true, message: '1 or more of the selected Invites are invalid' }
    }

    if (Number(user.gold) < NEW_STATE_COST)
        return { error: true, message: 'You cannot afford a new State' }

    const purchaseResult: [QueryResult, FieldPacket[]] | QueryError = await dbAddGold(user.user_id, -NEW_STATE_COST)

    if ((purchaseResult as QueryError).code !== undefined)
        return { error: true, message: 'Failed to make purchase in Database' }

    const newStateId: string = uuidv4()
    const newStateResult: [QueryResult, FieldPacket[]] | GenericError = await dbCreateState(newStateId, user.user_id, Number(user.empire), name, taxRate)

    if ((newStateResult as GenericError).error !== undefined)
        return newStateResult as GenericError

    const congregationIds: string[] = [...congregationList.map(c => c.congregation_id), ...inviteList.map(i => i.to.congregation_id)]

    const congregationUpdateResult: [QueryResult, FieldPacket[]] | GenericError = await dbUpdateCongregationsState(newStateId, congregationIds)

    if ((congregationUpdateResult as GenericError).error !== undefined)
        return congregationUpdateResult as GenericError

    for (const deleteInvite of inviteList) {
        const checkResult: [QueryResult, FieldPacket[]] | GenericError = await dbDeleteInvite(deleteInvite.user_from.id, deleteInvite.user_to.id, deleteInvite.to.congregation_id, Number(deleteInvite.type))
        
        if ((checkResult as GenericError).error !== undefined)
            return checkResult as GenericError
    }

    return { success: true, message: newStateId }
}

// edit a user's details using their username
export async function editUser(first: string, last: string, pfp: number, bio: string): Promise<GenericSuccess | GenericError> {
    const validName: string | void = await validateName(first, last)
    const validBio: string | void = await validateBio(bio)

    if (validName)
        return { error: true, message: validName }
    if (validBio)
        return { error: true, message: validBio }

    const pfpData: ProfileType | undefined = PROFILE_DATA.find(p => p.code === pfp)

    if (pfpData === undefined)
        return { error: true, message: 'Invalid Profile Picture' }

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

    const editResult: [QueryResult, FieldPacket[]] | GenericError = await dbEditUserDetailsByUsername(user.username, pfpData.code, first, last, bio)

    if ((editResult as GenericError).error !== undefined)
        return editResult as GenericError

    return { success: true, message: 'Changes Saved' }
}

// search for a user by username
export async function usernameSearch(username: string): Promise<UserDetails[] | GenericError> {
    if (username.trim() === '')
        return []

    const result: [User[], FieldPacket[]] | GenericError = await dbSearchUsersByUsername(username)

    if ((result as GenericError).error !== undefined)
        return result as GenericError

    return usersToSlugs((result as [User[], FieldPacket[]])[0])
}

// send a friend request by username
export async function sendFriendRequest(sendTo: string): Promise<RequestSlug | GenericError> {
    const at: Date = new Date()
    const cookieList = cookies()

    if (!cookieList.has('username'))
        redirect(AUTH_ROUTE)

    const username: string = cookieList.get('username')!.value

    const userResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetUser(username)

    if ((userResult as QueryError).code !== undefined || (userResult as [User[], FieldPacket[]])[0].length === 0) {
        console.log(userResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find User)' }
    }

    const from: UserDetails = usersToSlugs((userResult as [User[], FieldPacket[]])[0])[0]

    const toResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetUser(sendTo)

    if ((toResult as QueryError).code !== undefined || (toResult as [User[], FieldPacket[]])[0].length === 0) {
        console.log(toResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find Send To User)' }
    }

    const to: UserDetails = usersToSlugs((toResult as [User[], FieldPacket[]])[0])[0]

    const result: [QueryResult, FieldPacket[]] | GenericError = await dbSendFriendRequest(from.user_id, to.user_id, at)

    if ((result as GenericError).error !== undefined)
        return result as GenericError

    return {
        from: from,
        to: to,
        at: at
    }
}

export async function declineFriendRequest(from: string): Promise<GenericSuccess | GenericError> {
    const cookieList = cookies()

    if (!cookieList.has('username'))
        redirect(AUTH_ROUTE)

    const username: string = cookieList.get('username')!.value

    const userResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetUser(username)

    if ((userResult as QueryError).code !== undefined || (userResult as [User[], FieldPacket[]])[0].length === 0) {
        console.log(userResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find User)' }
    }

    const to: UserDetails = usersToSlugs((userResult as [User[], FieldPacket[]])[0])[0]

    const result: [QueryResult, FieldPacket[]] | GenericError = await dbDeleteRequest(from, to.user_id)

    if ((result as GenericError).error !== undefined)
        return result as GenericError

    return { success: true, message: 'Request Declined' }
}

export async function acceptFriendRequest(from: string): Promise<GenericSuccess | GenericError> {
    const since: Date = new Date()
    const cookieList = cookies()

    if (!cookieList.has('username'))
        redirect(AUTH_ROUTE)

    const username: string = cookieList.get('username')!.value

    const userResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetUser(username)

    if ((userResult as QueryError).code !== undefined || (userResult as [User[], FieldPacket[]])[0].length === 0) {
        console.log(userResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find User)' }
    }

    const to: UserDetails = usersToSlugs((userResult as [User[], FieldPacket[]])[0])[0]

    const result: [QueryResult, FieldPacket[]] | GenericError = await dbDeleteRequest(from, to.user_id)

    if ((result as GenericError).error !== undefined)
        return result as GenericError

    const check: [Friend[], FieldPacket[]] | GenericError = await dbGetFriendsByDetails(from, to.user_id)

    if ((check as GenericError).error !== undefined)
        return check as GenericError

    if ((check as [Friend[], FieldPacket[]])[0].length !== 0)
        return { error: true, message: 'You are already friends with this user' }

    const response: [QueryResult, FieldPacket[]] | GenericError = await dbMakeFriends(from, to.user_id, since)

    if ((response as GenericError).error !== undefined)
        return response as GenericError

    return { success: true, message: 'Request Accepted' }
}

export async function undoFriends(from: string): Promise<GenericSuccess | GenericError> {
    const since: Date = new Date()
    const cookieList = cookies()

    if (!cookieList.has('username'))
        redirect(AUTH_ROUTE)

    const username: string = cookieList.get('username')!.value

    const userResult: [QueryResult, FieldPacket[]] | QueryError = await dbGetUser(username)

    if ((userResult as QueryError).code !== undefined || (userResult as [User[], FieldPacket[]])[0].length === 0) {
        console.log(userResult)
        return { error: true, message: '500 INTERNAL SERVER ERROR (Did Not Find User)' }
    }

    const to: UserDetails = usersToSlugs((userResult as [User[], FieldPacket[]])[0])[0]

    const result: [QueryResult, FieldPacket[]] | GenericError = await dbDeleteRequest(from, to.user_id)

    if ((result as GenericError).error !== undefined)
        return result as GenericError

    const check: [QueryResult, FieldPacket[]] | GenericError = await dbDeleteFriends(from, to.user_id)

    if ((check as GenericError).error !== undefined)
        return check as GenericError

    return { success: true, message: 'Unfriended' }
}

export async function getUserByWorker(workerId: string): Promise<UserDetails | GenericError> {
    const result: [User[], FieldPacket[]] | GenericError = await dbGetUserByWorkerId(workerId)

    if ((result as GenericError).error !== undefined)
        return result as GenericError

    if ((result as [User[], FieldPacket[]])[0].length === 0)
        return { error: true, message: 'Failed to find worker user' }

    return usersToSlugs((result as [User[], FieldPacket[]])[0])[0]
}