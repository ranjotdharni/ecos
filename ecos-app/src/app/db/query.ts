import { FieldPacket, QueryResult, QueryError, RowDataPacket } from "mysql2";
import { db } from "./config";

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

// Add a new user to the database
export async function dbCreateUser(id: string, username: string, password: string, created_at: string): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = 'INSERT INTO users (user_id, username, password, created_at) VALUES (?, ?, ?, ?)'
        const params: string[] = [id, username, password, created_at]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// Generate new session
export async function dbGenerateSession(username: string, token: string, expiry: string): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        // destroy any existing sessions
        let query: string = 'DELETE FROM auth WHERE user_id = (SELECT user_id FROM users WHERE username = ?)'
        let params: string[] = [username]
        await conn.execute(query, params)

        // create new session
        query = `INSERT INTO auth (user_id, auth_token, expires_at) VALUES (
            (SELECT user_id FROM users WHERE username = ?),
            ?,
            ?    
        )`
        params = [username, token, expiry]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// Get session
export async function dbGetSession(username: string, token: string): Promise<[Session[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `SELECT * FROM auth WHERE auth_token = ? AND user_id = (
            SELECT user_id FROM users WHERE username = ?
        )`
        const params: string[] = [token, username]
        const response: [Session[], FieldPacket[]] = await conn.execute<Session[]>(query, params)
        conn.release()

        return response as [Session[], FieldPacket[]]        

    } catch (error) {
        return error as QueryError
    }
}

// Check login credentials
export async function dbCheckCredentials(username: string): Promise<[User[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = 'SELECT * FROM users WHERE username = ?'
        const params: string[] = [username]
        const response: [User[], FieldPacket[]] = await conn.execute<User[]>(query, params)
        conn.release()

        return response as [User[], FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}