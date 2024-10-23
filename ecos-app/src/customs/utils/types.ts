import { StaticImageData } from "next/image"
import { RowDataPacket } from "mysql2"

//*********************//
//                     //
//   Auth Data Types   //
//                     //
//*********************//

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
}

// auth table row data
export interface Session extends RowDataPacket {
    user_id: string,
    auth_token: string,
    expires_at: Date
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

//***********************//
//                       //
//  Business Data Types  //
//                       //
//***********************//

// client-side Business data
export interface BusinessData {
    type: number
    title: string
}