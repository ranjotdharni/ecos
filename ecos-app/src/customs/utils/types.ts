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
}

// auth table row data
export interface Session extends RowDataPacket {
    user_id: string
    auth_token: string
    expires_at: Date
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

//***********************//
//                       //
//    User Data Types    //
//                       //
//***********************//

/**
 * Non-sensitive user details for client-side use.
 *
 * @interface UserDetails
 * @property {string} username - The unique username of the user.
 * @property {string} firstname - The user's first name.
 * @property {string} lastname - The user's last name.
 * @property {number} empire - The user's empire (numeric, corresponds to empire).
 * @property {number} gold - The user's gold amount.
 */
export interface UserDetails {
    username: string
    firstname: string
    lastname: string
    empire: number
    gold: number
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