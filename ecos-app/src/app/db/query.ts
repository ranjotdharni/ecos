import { Business, BusinessEarnings, Congregation, CongregationSlug, GenericError, Session, State, User, Worker } from "@/customs/utils/types"
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

// get congregations and their associated state by empire
export async function dbGetCongregationsByUserEmpire(username: string): Promise<[Congregation[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            s.state_id AS state_state_id,
            s.*, 
            c.congregation_id AS congregation_congregation_id,
            c.*, 
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name,
            uc.first_name AS congregation_owner_first_name,
            uc.last_name AS congregation_owner_last_name
        FROM 
            states s
        LEFT JOIN 
            congregations c ON s.state_id = c.state_id
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        LEFT JOIN 
            users uc ON c.congregation_owner_id = uc.user_id
        WHERE 
            s.empire = (SELECT empire FROM users WHERE username = ?)
        `
        const params: (string | number)[] = [username]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Congregation[]>(query, params)
        conn.release()

        return response as [Congregation[], FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// get congregations by owner
export async function dbGetCongregationsByOwner(username: string): Promise<[Congregation[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            s.state_id AS state_state_id,
            s.*, 
            c.congregation_id AS congregation_congregation_id,
            c.*, 
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name,
            uc.first_name AS congregation_owner_first_name,
            uc.last_name AS congregation_owner_last_name
        FROM 
            states s
        LEFT JOIN 
            congregations c ON s.state_id = c.state_id
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        LEFT JOIN 
            users uc ON c.congregation_owner_id = uc.user_id
        WHERE 
            c.congregation_owner_id = (SELECT user_id FROM users WHERE username = ?)
        `
        const params: (string | number)[] = [username]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Business[]>(query, params)
        conn.release()

        return response as [Congregation[], FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Error while fetching congregations by owner from database' } as GenericError
    }
}

// get congregation by id
export async function dbGetCongregationById(congregationId: string): Promise<[Congregation[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            s.state_id AS state_state_id,
            s.*, 
            c.congregation_id AS congregation_congregation_id,
            c.*, 
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name,
            uc.first_name AS congregation_owner_first_name,
            uc.last_name AS congregation_owner_last_name
        FROM 
            states s
        LEFT JOIN 
            congregations c ON s.state_id = c.state_id
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        LEFT JOIN 
            users uc ON c.congregation_owner_id = uc.user_id
        WHERE 
            c.congregation_id = ?
        `
        const params: (string | number)[] = [congregationId]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Congregation[]>(query, params)
        conn.release()

        return response as [Congregation[], FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Fetch Congregation from Database' } as GenericError
    }
}

// search congregation by name or state name
export async function dbSearchCongregationsByNames(congregation?: string, state?: string): Promise<[Congregation[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            s.state_id AS state_state_id,
            s.*, 
            c.congregation_id AS congregation_congregation_id,
            c.*, 
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name,
            uc.first_name AS congregation_owner_first_name,
            uc.last_name AS congregation_owner_last_name
        FROM 
            states s
        LEFT JOIN 
            congregations c ON s.state_id = c.state_id
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        LEFT JOIN 
            users uc ON c.congregation_owner_id = uc.user_id
        WHERE 
            c.congregation_name LIKE CONCAT('%', ?, '%') 
            AND 
            s.state_name LIKE CONCAT('%', ?, '%')
        `
        const params: (string | number)[] = [congregation ? congregation : '', state ? state : '']
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Business[]>(query, params)
        conn.release()

        return response as [Congregation[], FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// get congregation by slug, primarily for existence check
export async function dbCheckCongregationExists(congregation: CongregationSlug): Promise<[Congregation[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            s.state_id AS state_state_id,
            s.*, 
            c.congregation_id AS congregation_congregation_id,
            c.*, 
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name,
            uc.first_name AS congregation_owner_first_name,
            uc.last_name AS congregation_owner_last_name
        FROM 
            states s
        LEFT JOIN 
            congregations c ON s.state_id = c.state_id
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        LEFT JOIN 
            users uc ON c.congregation_owner_id = uc.user_id
        WHERE 
            c.congregation_id = ? 
            AND
            s.state_id = ?
        `
        const params: (string | number)[] = [congregation.congregation_id, congregation.state.state_id]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Business[]>(query, params)
        conn.release()

        return response as [Congregation[], FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// create a new business
export async function dbNewBusiness(businessId: string, congregationId: string, ownerId: string, name: string, type: number, ber: number, rank: string, hiring: number, businessEarningId: string, createdAt: Date): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        let query: string = `
        INSERT INTO 
            businesses (business_id, congregation_id, business_owner_id, business_name, business_type, base_earning_rate, rank_earning_increase, hiring)
        VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?)
        `
        let params: (string | number)[] = [businessId, congregationId, ownerId, name, type, ber, rank, hiring]
        let response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)

        query = `
        INSERT INTO 
            business_earnings (business_earnings_id, business_id, last_earning, last_update) 
        VALUES 
            (?, ?, 0, ?)
        `
        params = [businessEarningId, businessId, dateToSQLDate(createdAt)]
        response = await conn.execute(query, params)

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

// Get business of a given congregation
export async function dbGetBusinessesByCongregation(congregationId: string): Promise<[Business[], FieldPacket[]] | GenericError> {
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
            c.congregation_id = ?
        `
        const params: (string | number)[] = [congregationId]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Business[]>(query, params)
        conn.release()

        return response as [Business[], FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to fetch businesses by congregation from database' }
    }
}

// get all business earnings of a user
export async function dbGetBusinessesEarnings(username: string): Promise<[BusinessEarnings[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            * 
        FROM 
            business_earnings 
        WHERE
            business_id IN (
                SELECT 
                    business_id 
                FROM
                    businesses 
                WHERE 
                    business_owner_id = (
                        SELECT 
                            user_id 
                        FROM 
                            users 
                        WHERE 
                            username = ?
                    )
            ) 
        `
        const params: (string | number)[] = [username]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Worker[]>(query, params)
        conn.release()

        return response as [BusinessEarnings[], FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// get business earnings by business id
export async function dbGetBusinessEarningsByBusiness(businessId: string): Promise<[BusinessEarnings[], FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            * 
        FROM 
            business_earnings 
        WHERE
            business_id = ? 
        `
        const params: (string | number)[] = [businessId]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Worker[]>(query, params)
        conn.release()

        return response as [BusinessEarnings[], FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// update business earnings 
export async function dbUpdateBusinessEarnings(username: string, businessId: string, lastEarning: number, lastUpdate: Date): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        UPDATE 
            business_earnings 
        SET 
            last_earning = ?, last_update = ? 
        WHERE 
            business_id = (
                SELECT 
                    business_id 
                FROM 
                    businesses 
                WHERE 
                    business_id = ? 
                AND 
                    business_owner_id = (
                        SELECT 
                            user_id 
                        FROM 
                            users 
                        WHERE 
                            username = ?
                    )
            )
        `
        const params: (string | number)[] = [lastEarning, dateToSQLDate(lastUpdate), businessId, username]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Worker[]>(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// get workers belonging to a business
export async function dbGetWorkersByBusinessId(businessId: string): Promise<[Worker[], FieldPacket[]] | QueryError> {
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
            w.business_id AS worker_business_id,
            w.*,
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name,
            uc.first_name AS congregation_owner_first_name,
            uc.last_name AS congregation_owner_last_name,
            ub.first_name AS business_owner_first_name,
            ub.last_name AS business_owner_last_name,
            uw.first_name AS worker_first_name,
            uw.last_name AS worker_last_name,
            COALESCE(wb.worker_count, 0) AS worker_count
        FROM 
            states s
        JOIN 
            congregations c ON s.state_id = c.state_id
        JOIN 
            businesses b ON c.congregation_id = b.congregation_id
        JOIN
            workers w ON b.business_id = w.business_id
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        LEFT JOIN 
            users uc ON c.congregation_owner_id = uc.user_id
        LEFT JOIN 
            users ub ON b.business_owner_id = ub.user_id
        LEFT JOIN 
            users uw ON w.user_id = uw.user_id
        LEFT JOIN (
            SELECT 
                business_id AS worker_business_id,
                COUNT(*) AS worker_count
            FROM 
                workers
            GROUP BY 
                business_id
        ) wb ON b.business_id = wb.worker_business_id
        WHERE 
            b.business_id = ?
        `
        const params: (string | number)[] = [businessId]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Worker[]>(query, params)
        conn.release()

        return response as [Worker[], FieldPacket[]]

    } catch (error) {
        return error as QueryError
    }
}

// get job
export async function dbGetJobs(username: string): Promise<[Worker[], FieldPacket[]] | QueryError> {
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
            w.business_id AS worker_business_id,
            w.*,
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name,
            uc.first_name AS congregation_owner_first_name,
            uc.last_name AS congregation_owner_last_name,
            ub.first_name AS business_owner_first_name,
            ub.last_name AS business_owner_last_name,
            uw.first_name AS worker_first_name,
            uw.last_name AS worker_last_name,
            COALESCE(wb.worker_count, 0) AS worker_count
        FROM 
            states s
        JOIN 
            congregations c ON s.state_id = c.state_id
        JOIN 
            businesses b ON c.congregation_id = b.congregation_id
        JOIN
            workers w ON b.business_id = w.business_id
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        LEFT JOIN 
            users uc ON c.congregation_owner_id = uc.user_id
        LEFT JOIN 
            users ub ON b.business_owner_id = ub.user_id
        LEFT JOIN 
            users uw ON w.user_id = uw.user_id
        LEFT JOIN (
            SELECT 
                business_id AS worker_business_id,
                COUNT(*) AS worker_count
            FROM 
                workers
            GROUP BY 
                business_id
        ) wb ON b.business_id = wb.worker_business_id
        WHERE 
            w.user_id = (SELECT user_id FROM users WHERE username = ?)
        `
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

// edit a worker's rank
export async function dbEditWorkerRank(workerId: string, workerRank: number): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `UPDATE workers SET worker_rank = ? WHERE worker_id = ?`
        const params: (string | number)[] = [workerRank, workerId]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]
    } catch (error) {
        return error as QueryError
    }
}

// edit a worker's rank
export async function dbFireWorker(workerId: string): Promise<[QueryResult, FieldPacket[]] | QueryError> {
    try {
        const conn = await db.getConnection()

        const query: string = `DELETE FROM workers WHERE worker_id = ?`
        const params: (string | number)[] = [workerId]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]
    } catch (error) {
        return error as QueryError
    }
}

// get state by id
export async function dbGetStateById(stateId: string): Promise<[State[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            s.*,
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name
        FROM 
            states s
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        WHERE 
            s.state_id = ?
        `
        const params: (string | number)[] = [stateId]
        const response: [State[], FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [State[], FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Fetch States By Empire From Database' } as GenericError
    }
}

// get states in empire
export async function dbGetStatesByEmpire(empire: number): Promise<[State[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            s.*,
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name
        FROM 
            states s
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        WHERE 
            s.empire = ?
        `
        const params: (string | number)[] = [empire]
        const response: [State[], FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [State[], FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Fetch States By Empire From Database' } as GenericError
    }
}

// create new congregation w/ businesses
export async function dbCreateNewCongregation(cid: string, empire: number, sid: string, coid: string, name: string, split: string, status: number, ctr: number, ceid: string, createdAt: Date): Promise<[QueryResult, FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        let query: string = `
        INSERT INTO 
            congregations  
            (congregation_id, empire, state_id, congregation_owner_id, congregation_name, labor_split, congregation_status, congregation_tax_rate) 
        VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?)
        `
        let params: (string | number)[] = [cid, empire, sid, coid, name, split, status, ctr]
        let response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)

        query = `
        INSERT INTO 
            congregation_earnings (congregation_earnings_id, congregation_id, last_earning, last_update) 
        VALUES 
            (?, ?, 0, ?)
        `
        params = [ceid, cid, dateToSQLDate(createdAt)]

        conn.release()

        return response as [QueryResult, FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Create New Congregation in Database' } as GenericError
    }
}