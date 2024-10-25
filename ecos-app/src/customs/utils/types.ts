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

// business table row data
export interface Business extends RowDataPacket {
    business_id: string
    congregation_id: string
    business_owner_id: string | null
    business_name: string
    business_type: number
    base_earning_rate: number
    rank_earning_increase: number
    hiring: number
}

//***********************//
//                       //
//    User Data Types    //
//                       //
//***********************//

// client-side user details
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