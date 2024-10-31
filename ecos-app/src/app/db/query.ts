import { Business, Session, User, Worker } from "@/customs/utils/types"
import { FieldPacket, QueryResult, QueryError } from "mysql2"
import { dateToSQLDate } from "@/customs/utils/tools"
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

// Get business by owner
export async function dbGetBusinessesByOwner(username: string): Promise<[Business[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            s.state_id AS state_state_id,
            s.*, 
            c.congregation_id AS congregation_congregation_id,
            c.*, 
            b.congregation_id AS business_congregation_id,
            b.*,
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name,
            uc.first_name AS congregation_owner_first_name,
            uc.last_name AS congregation_owner_last_name,
            ub.first_name AS business_owner_first_name,
            ub.last_name AS business_owner_last_name,
            COALESCE(w.worker_count, 0) AS worker_count
        FROM 
            states s
        JOIN 
            congregations c ON s.state_id = c.state_id
        JOIN 
            businesses b ON c.congregation_id = b.congregation_id
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        LEFT JOIN 
            users uc ON c.congregation_owner_id = uc.user_id
        LEFT JOIN 
            users ub ON b.business_owner_id = ub.user_id
        LEFT JOIN (
            SELECT 
                business_id,
                COUNT(*) AS worker_count
            FROM 
                workers
            GROUP BY 
                business_id
        ) w ON b.business_id = w.business_id
        WHERE 
            b.business_owner_id = (SELECT user_id FROM users WHERE username = ?)
        `
        const params: (string | number)[] = [username]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Business[]>(query, params)
        conn.release()

        return response as [Business[], FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// Get businesses of a given empire
export async function dbGetBusinessesInEmpire(empire: number): Promise<[Business[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            s.state_id AS state_state_id,
            s.*, 
            c.congregation_id AS congregation_congregation_id,
            c.*, 
            b.congregation_id AS business_congregation_id,
            b.*,
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name,
            uc.first_name AS congregation_owner_first_name,
            uc.last_name AS congregation_owner_last_name,
            ub.first_name AS business_owner_first_name,
            ub.last_name AS business_owner_last_name,
            COALESCE(w.worker_count, 0) AS worker_count
        FROM 
            states s
        JOIN 
            congregations c ON s.state_id = c.state_id
        JOIN 
            businesses b ON c.congregation_id = b.congregation_id
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        LEFT JOIN 
            users uc ON c.congregation_owner_id = uc.user_id
        LEFT JOIN 
            users ub ON b.business_owner_id = ub.user_id
        LEFT JOIN (
            SELECT 
                business_id,
                COUNT(*) AS worker_count
            FROM 
                workers
            GROUP BY 
                business_id
        ) w ON b.business_id = w.business_id
        WHERE 
            s.empire = ?
        `
        const params: (string | number)[] = [empire]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Business[]>(query, params)
        conn.release()

        return response as [Business[], FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// Get business of a given business id
export async function dbGetBusinessById(businessId: string): Promise<[Business[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            s.state_id AS state_state_id,
            s.*, 
            c.congregation_id AS congregation_congregation_id,
            c.*, 
            b.congregation_id AS business_congregation_id,
            b.*,
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name,
            uc.first_name AS congregation_owner_first_name,
            uc.last_name AS congregation_owner_last_name,
            ub.first_name AS business_owner_first_name,
            ub.last_name AS business_owner_last_name,
            COALESCE(w.worker_count, 0) AS worker_count
        FROM 
            states s
        JOIN 
            congregations c ON s.state_id = c.state_id
        JOIN 
            businesses b ON c.congregation_id = b.congregation_id
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        LEFT JOIN 
            users uc ON c.congregation_owner_id = uc.user_id
        LEFT JOIN 
            users ub ON b.business_owner_id = ub.user_id
        LEFT JOIN (
            SELECT 
                business_id,
                COUNT(*) AS worker_count
            FROM 
                workers
            GROUP BY 
                business_id
        ) w ON b.business_id = w.business_id
        WHERE 
            b.business_id = ?
        `
        const params: (string | number)[] = [businessId]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Business[]>(query, params)
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

// set user's gold value
export async function dbAddGold(userId: string, gold: number): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `UPDATE users SET gold = gold + ? WHERE user_id = ?`
        const params: (string | number)[] = [gold, userId]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]
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

// clock worker in
export async function dbClockIn(time: Date, workerId: string): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `UPDATE workers SET clocked_in = ? WHERE worker_id = ?`
        const params: (string | number)[] = [dateToSQLDate(time), workerId]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]
    } catch (error) {
        return error as QueryError
    }
}

// clock worker out
export async function dbClockOut(time: Date, workerId: string): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `UPDATE workers SET clocked_out = ? WHERE worker_id = ?`
        const params: (string | number)[] = [dateToSQLDate(time), workerId]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]
    } catch (error) {
        return error as QueryError
    }
}