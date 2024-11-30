import { StaticImageData } from "next/image"
import { RowDataPacket } from "mysql2"

//*********************//
//                     //
//   Auth Data Types   //
//                     //
//*********************//

// Generic error type
export interface GenericError {
    error: boolean
    message: string
}

// Generic success type
export interface GenericSuccess {
    success: boolean
    message: string
}

// Auth forms submit slug
export interface AuthFormSlug {
    firstname?: string
    lastname?: string
    username: string
    password: string
    confirm?: string
}

//*********************//
//                     //
// Database Data Types //
//                     //
//*********************//

// user table row data
export interface User extends RowDataPacket {
    user_id: string
    username: string
    password: string
    empire: number | null
    created_at: Date
    first_name: string
    last_name: string
    gold: number
    pfp: number
    bio: string
}

// requests table row data
export interface Request extends RowDataPacket {
    from: string
    to: string
    requested_at: Date
    from_user_id: string
    from_username: string
    from_password: string
    from_empire: number | null
    from_first_name: string
    from_last_name: string
    from_gold: number
    from_pfp: number
    from_bio: string
    to_user_id: string
    to_username: string
    to_password: string
    to_empire: number | null
    to_first_name: string
    to_last_name: string
    to_gold: number
    to_pfp: number
    to_bio: string
}

// friends table row data
export interface Friend extends RowDataPacket {
    friend1: string
    friend2: string
    friends_since: Date
    friend1_user_id: string
    friend1_username: string
    friend1_password: string
    friend1_empire: number | null
    friend1_first_name: string
    friend1_last_name: string
    friend1_gold: number
    friend1_pfp: number
    friend1_bio: string
    friend2_user_id: string
    friend2_username: string
    friend2_password: string
    friend2_empire: number | null
    friend2_first_name: string
    friend2_last_name: string
    friend2_gold: number
    friend2_pfp: number
    friend2_bio: string
}

// auth table row data
export interface Session extends RowDataPacket {
    user_id: string
    auth_token: string
    expires_at: Date
}

// state row data (+state owner name)
export interface State extends RowDataPacket {
    state_id: string
    state_owner_id: string | null
    empire: number
    state_name: string
    state_tax_rate: number
    state_owner_first_name: string | null
    state_owner_last_name: string | null
}

// state -> congregation joined tables row data
export interface Congregation extends RowDataPacket {
    state_state_id: string
    state_id: string
    state_owner_id: string | null
    empire: number
    state_name: string
    state_tax_rate: number
    congregation_congregation_id: string
    congregation_id: string
    congregation_owner_id: string | null
    congregation_name: string
    labor_split: number
    congregation_status: number
    congregation_tax_rate: number
    state_owner_first_name: string | null
    state_owner_last_name: string | null
    congregation_owner_first_name: string | null
    congregation_owner_last_name: string | null
}

// congregation_earnings table row data
export interface CongregationEarnings extends RowDataPacket {
    congregation_earnings_id: string
    congregation_id: string
    last_earning: number
    last_update: Date
}

// state -> congregation -> business joined tables row data (+ owner names)
export interface Business extends RowDataPacket {
    state_state_id: string
    state_id: string
    state_owner_id: string | null
    empire: number
    state_name: string
    state_tax_rate: number
    congregation_congregation_id: string
    congregation_id: string
    congregation_owner_id: string | null
    congregation_name: string
    labor_split: number
    congregation_status: number
    congregation_tax_rate: number
    business_congregation_id: string
    business_id: string
    business_owner_id: string | null
    business_name: string
    business_type: number
    base_earning_rate: number
    rank_earning_increase: number
    hiring: number
    worker_count: number
    state_owner_first_name: string | null
    state_owner_last_name: string | null
    congregation_owner_first_name: string | null
    congregation_owner_last_name: string | null
    business_owner_first_name: string | null
    business_owner_last_name: string | null
}

// business_earnings table row data
export interface BusinessEarnings extends RowDataPacket {
    business_earnings_id: string
    business_id: string
    last_earning: number
    last_update: Date
}

// state -> congregation -> business -> worker joined tables row data (+ owner names + worker name)
export interface Worker extends RowDataPacket {
    worker_id: string
    user_id: string
    business_id: string
    worker_rank: number
    clocked_in: Date | null
    clocked_out: Date | null
    worker_business_id: string
    worker_first_name: string
    worker_last_name: string
    state_state_id: string
    state_id: string
    state_owner_id: string | null
    empire: number
    state_name: string
    state_tax_rate: number
    congregation_congregation_id: string
    congregation_id: string
    congregation_owner_id: string | null
    congregation_name: string
    labor_split: number
    congregation_status: number
    congregation_tax_rate: number
    business_congregation_id: string
    business_owner_id: string | null
    business_name: string
    business_type: number
    base_earning_rate: number
    rank_earning_increase: number
    hiring: number
    worker_count: number
    state_owner_first_name: string | null
    state_owner_last_name: string | null
    congregation_owner_first_name: string | null
    congregation_owner_last_name: string | null
    business_owner_first_name: string | null
    business_owner_last_name: string | null
}

export interface Collection extends RowDataPacket {
    collection_id: string,
    str: number,
    ctr: number,
    total_split: number,
    revenue: number,
    collected_at: Date,
    state_state_id: string
    state_id: string
    state_owner_id: string | null
    empire: number
    state_name: string
    state_tax_rate: number
    congregation_congregation_id: string
    congregation_id: string
    congregation_owner_id: string | null
    congregation_name: string
    labor_split: number
    congregation_status: number
    congregation_tax_rate: number
    business_congregation_id: string
    business_id: string
    business_owner_id: string | null
    business_name: string
    business_type: number
    base_earning_rate: number
    rank_earning_increase: number
    hiring: number
    worker_count: number
    state_owner_first_name: string | null
    state_owner_last_name: string | null
    congregation_owner_first_name: string | null
    congregation_owner_last_name: string | null
    business_owner_first_name: string | null
    business_owner_last_name: string | null
}

export interface Invite extends RowDataPacket {
    user_from: string
    user_to: string
    invite_from: string | undefined
    invite_to: string 
    invite_type: number
    accepted: number
    invited_at: Date
}

export interface StateInviteMutable extends RowDataPacket {
    user_from: string
    user_to: string
    invite_from: string | null
    invite_to: string 
    invite_type: number
    accepted: number
    invited_at: Date
    state_id: string | undefined
    state_owner_id: string | undefined
    empire: number
    state_name: string | undefined
    state_tax_rate: number | undefined
    congregation_id: string
    congregation_owner_id: string | null
    congregation_name: string
    labor_split: number
    congregation_status: number
    congregation_tax_rate: number
    user_from_user_id: string,
    user_from_username: string,
    user_from_first_name: string,
    user_from_last_name: string,
    user_to_user_id: string,
    user_to_username: string,
    user_to_first_name: string,
    user_to_last_name: string,
    state_owner_first_name: string | null
    state_owner_last_name: string | null
    congregation_owner_first_name: string | null
    congregation_owner_last_name: string | null
    congregation_state_id: string,
    congregation_state_owner: string,
    congregation_state_empire: number,
    congregation_state_name: string,
    congregation_state_tax_rate: number,
    congregation_state_owner_first_name: string,
    congregation_state_owner_last_name: string
}

//***********************//
//                       //
//    User Data Types    //
//                       //
//***********************//

/**
 * Non-sensitive user details for client-side use.
 *
 * @interface UserDetails
 * @property {string} user_id - The unique id of the user.
 * @property {string} username - The unique username of the user.
 * @property {string} firstname - The user's first name.
 * @property {string} lastname - The user's last name.
 * @property {number} empire - The user's empire (numeric, corresponds to empire).
 * @property {number} gold - The user's gold amount.
 * @property {number} pfp - The user's profile icon code.
 * @property {string} bio - The user's bio.
 */
export interface UserDetails {
    user_id: string
    username: string
    firstname: string
    lastname: string
    empire: number
    gold: number
    pfp: number
    bio: string
}

export interface ProfileType {
    title: string
    code: number
    icon: string
}

//*********************//
//                     //
//  Empire Data Types  //
//                     //
//*********************//

// client-side Empire data
export interface EmpireData {
    code: number
    name: string
    sigil: StaticImageData
    desc: string
}

//***************************//
//                           //
//  Congregation Data Types  //
//                           //
//***************************//

export interface CongregationType {
    type: number
    title: string
    icon: string
}

//***********************//
//                       //
//  Business Data Types  //
//                       //
//***********************//

// client-side business type data
export interface BusinessType {
    type: number 
    title: string 
    icon: string
}

//**********************************//
//                                  //
//  Client-side General Data Types  //
//                                  //
//**********************************//

export interface BusinessSlug {
    business_id: string
    congregation: CongregationSlug
    business_owner_firstname: string | null
    business_owner_lastname: string | null
    business_name: string
    business_type: number
    base_earning_rate: number
    rank_earning_increase: number
    worker_count: number
    hiring: boolean
}

export interface CongregationSlug {
    congregation_id: string
    empire: number
    state: StateSlug
    congregation_owner_firstname: string | null
    congregation_owner_lastname: string | null
    congregation_name: string
    labor_split: number
    congregation_status: number
    congregation_tax_rate: number
}

export interface StateSlug {
    state_id: string
    state_owner_firstname: string | null
    state_owner_lastname: string | null
    empire: number
    state_name: string
    state_tax_rate: number
}

export interface WorkerSlug {
    worker_id: string
    business: BusinessSlug
    firstname: string
    lastname: string
    worker_rank: number
    clocked_in: Date | null
    clocked_out: Date | null
}

export interface CollectionSlug {
    collection_id: string,
    str: number,
    ctr: number,
    total_split: number,
    revenue: number,
    collected_at: Date,
    business: BusinessSlug
}

export interface RequestSlug {
    from: UserDetails
    to: UserDetails
    at: Date
}

export interface FriendSlug {
    friend1: UserDetails
    friend2: UserDetails
    since: Date
}

export interface NewBusiness {
    index: number
    name: string
    rank: string
    businessType: number
}

export interface StateInvite {
    user_from: {
        id: string,
        username: string,
        first: string,
        last: string
    },
    user_to: {
        id: string,
        username: string,
        first: string,
        last: string
    },
    from: StateSlug | undefined,
    to: CongregationSlug,
    type: number,
    accepted: number,
    at: Date
}

//**********************************//
//                                  //
//    Server-side Utility Types     //
//                                  //
//**********************************//

export interface BusinessEarningComponents {
    businessId: string,
    str: number,
    ctr: number,
    baseEarningRate: number,
    uncollectedEarnings: number,
    timeSinceLastUpdate: number
}