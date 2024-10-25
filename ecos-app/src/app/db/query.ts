import { Business, Session, User, Worker } from "@/customs/utils/types"
import { FieldPacket, QueryResult, QueryError } from "mysql2"
import { db } from "./config"

// Add a new user to the database
export async function dbCreateUser(id: string, firstname: string, lastname: string, username: string, password: string, created_at: string): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = 'INSERT INTO users (user_id, first_name, last_name, username, password, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        const params: string[] = [id, firstname, lastname, username, password, created_at]
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
export async function dbGetSession(username: string): Promise<[Session[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `SELECT * FROM auth WHERE user_id = (
            SELECT user_id FROM users WHERE username = ?
        )`
        const params: string[] = [username]
        const response: [Session[], FieldPacket[]] = await conn.execute<Session[]>(query, params)
        conn.release()

        return response as [Session[], FieldPacket[]]        

    } catch (error) {
        return error as QueryError
    }
}

// Check login credentials
export async function dbGetUser(username: string): Promise<[User[], FieldPacket[]] | QueryError> {
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

// Set empire
export async function dbSetEmpire(username: string, empire: number): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `UPDATE users SET empire = ? WHERE username = ?`
        const params: (string | number)[] = [empire, username]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// Drop user session
export async function dbDropSession(username: string): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `DELETE FROM auth WHERE user_id = (SELECT user_id FROM users WHERE username = ?)`
        const params: (string | number)[] = [username]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// Get businesses of a given empire
export async function dbGetBusinessesInEmpire(empire: number): Promise<[Business[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = 'SELECT * FROM businesses WHERE congregation_id IN (SELECT congregation_id FROM congregations WHERE empire = ?)'
        const params: (string | number)[] = [empire]
        const response: [Business[], FieldPacket[]] = await conn.execute<Business[]>(query, params)
        conn.release()

        return response as [Business[], FieldPacket[]]
    } catch (error) {
        return error as QueryError
    }
}

// get job(s)
export async function dbGetJobs(username: string): Promise<[Worker[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `SELECT * FROM workers WHERE user_id = (SELECT user_id FROM users WHERE username = ?)`
        const params: (string | number)[] = [username]
        const response: [Worker[], FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [Worker[], FieldPacket[]]
    } catch (error) {
        return error as QueryError
    }
}

// Select a job
export async function dbSelectJob(workerId: string, username: string, businessId: string): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `INSERT INTO workers (worker_id, business_id, worker_rank, user_id) VALUES (?, ?, 0, (SELECT user_id FROM users WHERE username = ?))`
        const params: (string | number)[] = [workerId, businessId, username]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]
    } catch (error) {
        return error as QueryError
    }
}