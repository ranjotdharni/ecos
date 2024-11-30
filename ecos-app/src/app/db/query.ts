import { Business, BusinessEarnings, Collection, Congregation, CongregationSlug, Friend, GenericError, Invite, Request, Session, State, StateInvite, StateInviteMutable, User, Worker } from "@/customs/utils/types"
import { dateToSQLDate, stateInviteMutablesToSlugs } from "@/customs/utils/tools"
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

// Get user credentials by user id
export async function dbGetUserById(userId: string): Promise<[User[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = 'SELECT * FROM users WHERE user_id = ?'
        const params: string[] = [userId]
        const response: [User[], FieldPacket[]] = await conn.execute<User[]>(query, params)
        conn.release()

        return response as [User[], FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Fetch User From Database' } as GenericError
    }
}

// find users by searching for username
export async function dbSearchUsersByUsername(username: string): Promise<[User[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT
            *
        FROM
            users
        WHERE 
            username LIKE ?
        `
        const params: (string | number)[] = [`%${username}%`]
        const response: [User[], FieldPacket[]] | QueryError = await conn.execute<User[]>(query, params)
        conn.release()

        return response as [User[], FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Search for Users in Database' } as GenericError
    }
}

// Edit user details by username
export async function dbEditUserDetailsByUsername(username: string, pfp: number, first: string, last: string, bio: string): Promise<[QueryResult, FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        UPDATE
            users
        SET
            first_name = ?,
            last_name = ?,
            bio = ?,
            pfp = ?
        WHERE 
            username = ?
        `
        const params: (string | number)[] = [first, last, bio, pfp, username]
        const response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Edit User Details in Database' } as GenericError
    }
}

// make a friend request to another user
export async function dbSendFriendRequest(from: string, to: string, at: Date): Promise<[QueryResult, FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        INSERT INTO
            requests (user_from, user_to, requested_at)
        VALUES
            (?, ?, ?)
        `
        const params: (string | number)[] = [from, to, dateToSQLDate(at)]
        const response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Add Friend Request in Database' } as GenericError
    }
}

// get all requests of a user (from or to) by id
export async function dbGetRequests(userId: string): Promise<[Request[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT
            r.*,
            f.user_id as from_user_id,
            f.username as from_username,
            f.empire as from_empire,
            f.first_name as from_first_name,
            f.last_name as from_last_name,
            f.gold as from_gold,
            f.pfp as from_pfp,
            f.bio as from_bio,
            t.user_id as to_user_id,
            t.username as to_username,
            t.empire as to_empire,
            t.first_name as to_first_name,
            t.last_name as to_last_name,
            t.gold as to_gold,
            t.pfp as to_pfp,
            t.bio as to_bio
        FROM
            requests r
        JOIN
            users f ON r.user_from = f.user_id
        JOIN 
            users t ON r.user_to = t.user_id
        WHERE 
            r.user_from = ? OR r.user_to = ?
        `
        const params: (string | number)[] = [userId, userId]
        const response: [Request[], FieldPacket[]] | QueryError = await conn.execute<Request[]>(query, params)
        conn.release()

        return response as [Request[], FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Find Requests in Database' } as GenericError
    }
}

// clear a request between any two parties either way
export async function dbDeleteRequest(user1: string, user2: string): Promise<[QueryResult, FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        DELETE FROM
            requests
        WHERE
                (user_from = ? AND user_to = ?)
            OR
                (user_from = ? AND user_to = ?)
        `
        const params: (string | number)[] = [user1, user2, user2, user1]
        const response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Delete Friend Request From Database' } as GenericError
    }
}

// create a pair of friends !!!MAKE SURE TO CLEAR ANY REQUESTS BEFORE  INVOKING THIS!!!!
export async function dbMakeFriends(user1: string, user2: string, since: Date): Promise<[QueryResult, FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        INSERT INTO
            friends (friend1, friend2, friends_since)
        VALUES
            (?, ?, ?)
        `
        const params: (string | number)[] = [user1, user2, dateToSQLDate(since)]
        const response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Make Friends In Database' } as GenericError
    }
}

// delete a pair of friends
export async function dbDeleteFriends(user1: string, user2: string): Promise<[QueryResult, FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        DELETE FROM
            friends
        WHERE
                (friend1 = ? AND friend2 = ?)
            OR
                (friend1 = ? AND friend2 = ?)
        `
        const params: (string | number)[] = [user1, user2, user2, user1]
        const response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Delete Friends In Database' } as GenericError
    }
}

// get all friends of a user by id
export async function dbGetFriends(userId: string): Promise<[Friend[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT
            f.*,
            f1.user_id as friend1_user_id,
            f1.username as friend1_username,
            f1.empire as friend1_empire,
            f1.first_name as friend1_first_name,
            f1.last_name as friend1_last_name,
            f1.gold as friend1_gold,
            f1.pfp as friend1_pfp,
            f1.bio as friend1_bio,
            f2.user_id as friend2_user_id,
            f2.username as friend2_username,
            f2.empire as friend2_empire,
            f2.first_name as friend2_first_name,
            f2.last_name as friend2_last_name,
            f2.gold as friend2_gold,
            f2.pfp as friend2_pfp,
            f2.bio as friend2_bio
        FROM
            friends f
        JOIN
            users f1 ON f.friend1 = f1.user_id
        JOIN 
            users f2 ON f.friend2 = f2.user_id
        WHERE 
            f.friend1 = ? OR f.friend2 = ?
        `
        const params: (string | number)[] = [userId, userId]
        const response: [Friend[], FieldPacket[]] | QueryError = await conn.execute<Friend[]>(query, params)
        conn.release()

        return response as [Friend[], FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Find Friends in Database' } as GenericError
    }
}

// get all friends of a user by id
export async function dbGetFriendsByDetails(user1: string, user2: string): Promise<[Friend[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT
            f.*,
            f1.user_id as friend1_user_id,
            f1.username as friend1_username,
            f1.empire as friend1_empire,
            f1.first_name as friend1_first_name,
            f1.last_name as friend1_last_name,
            f1.gold as friend1_gold,
            f1.pfp as friend1_pfp,
            f1.bio as friend1_bio,
            f2.user_id as friend2_user_id,
            f2.username as friend2_username,
            f2.empire as friend2_empire,
            f2.first_name as friend2_first_name,
            f2.last_name as friend2_last_name,
            f2.gold as friend2_gold,
            f2.pfp as friend2_pfp,
            f2.bio as friend2_bio
        FROM
            friends f
        JOIN
            users f1 ON f.friend1 = f1.user_id
        JOIN 
            users f2 ON f.friend2 = f2.user_id
        WHERE 
                (f.friend1 = ? AND f.friend2 = ?)
            OR
                (f.friend1 = ? AND f.friend2 = ?)
        `
        const params: (string | number)[] = [user1, user2, user2, user1]
        const response: [Friend[], FieldPacket[]] | QueryError = await conn.execute<Friend[]>(query, params)
        conn.release()

        return response as [Friend[], FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Find Friends in Database' } as GenericError
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

// get congregations by state
export async function dbGetCongregationsByState(stateId: string): Promise<[Congregation[], FieldPacket[]] | GenericError> {
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
            s.state_id = ?
        `
        const params: (string | number)[] = [stateId]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Congregation[]>(query, params)
        conn.release()

        return response as [Congregation[], FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Fetch Congregations from Database' } as GenericError
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
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Congregation[]>(query, params)
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

// Get business of a given state
export async function dbGetBusinessesByState(stateId: string): Promise<[Business[], FieldPacket[]] | GenericError> {
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
            s.state_id = ?
        `
        const params: (string | number)[] = [stateId]
        const response: [QueryResult, FieldPacket[]] = await conn.execute<Business[]>(query, params)
        conn.release()

        return response as [Business[], FieldPacket[]]

    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to fetch businesses by state from database' }
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

//state_id, state_owner_id, empire, state_name, state_tax_rate
// create a new state
export async function dbCreateState(id: string, ownerId: string, empire: number, name: string, tax: string): Promise<[QueryResult, FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        INSERT INTO 
            states (state_id, state_owner_id, empire, state_name, state_tax_rate) 
        VALUES 
            (?, ?, ?, ?, ?)
        `
        const params: (string | number)[] = [id, ownerId, empire, name, tax]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Create State In Database' } as GenericError
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

// get states by owner
export async function dbGetStatesByOwner(username: string): Promise<[State[], FieldPacket[]] | GenericError> {
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
            s.state_owner_id = (
                SELECT
                    user_id 
                FROM 
                    users 
                WHERE 
                    username = ?
            )
        `
        const params: (string | number)[] = [username]
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

// update the state ids of a set of congregations (using an array of their congregation ids)
export async function dbUpdateCongregationsState(s_id: string, c_ids: string[]): Promise<[QueryResult, FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        UPDATE 
            congregations  
        SET
            state_id = ? 
        WHERE
            congregation_id IN (${Array(c_ids.length).fill("?").join(', ')})
        `
        const params: (string | number)[] = [s_id, ...c_ids]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Add Congregations to State in Database' } as GenericError
    }
}

// create new collection entry
export async function dbAddCollectionEntry(collectionId: string, businessId: string, str: number, ctr: number, totalSplit: number, collectedAt: Date, revenue: number): Promise<[QueryResult, FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        INSERT INTO 
            collections (collection_id, business_id, str, ctr, total_split, collected_at, revenue) 
        VALUES 
            (?, ?, ?, ?, ?, ?, ?)
        `
        const params: (string | number)[] = [collectionId, businessId, str, ctr, totalSplit, dateToSQLDate(collectedAt), revenue]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Create New Collection Entry in Database' } as GenericError
    }
}

// get all collections by business
export async function dbGetCollectionsByBusiness(businessId: string): Promise<[Collection[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            col.*,
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
        JOIN
            collections col ON b.business_id = col.business_id
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
        ORDER BY 
            col.collected_at DESC
        `
        const params: (string | number)[] = [businessId]
        const response: [Collection[], FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [Collection[], FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Fetch Collection Entries From Database' } as GenericError
    }
}

// get all collections by congregation
export async function dbGetCollectionsByCongregation(congregationId: string): Promise<[Collection[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            col.*,
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
        JOIN
            collections col ON b.business_id = col.business_id
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
        ORDER BY 
            col.collected_at DESC
        `
        const params: (string | number)[] = [congregationId]
        const response: [Collection[], FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [Collection[], FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Fetch Collection Entries From Database' } as GenericError
    }
}

// get all collections by state
export async function dbGetCollectionsByState(stateId: string): Promise<[Collection[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            col.*,
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
        JOIN
            collections col ON b.business_id = col.business_id
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
            s.state_id = ? 
        ORDER BY 
            col.collected_at DESC
        `
        const params: (string | number)[] = [stateId]
        const response: [Collection[], FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [Collection[], FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Fetch Collection Entries From Database' } as GenericError
    }
}

// send an invite
export async function dbSendInvite(u_from: string, u_to: string, to: string, type: number, at: Date, from?: string): Promise<[QueryResult, FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        INSERT INTO 
            invites (user_from, user_to, invite_from, invite_to, invite_type, accepted, invited_at)
        VALUES
            (?, ?, ?, ?, ?, ?, ?)
        `
        const params: (string | number | null)[] = [u_from, u_to, from ? from : null, to, type, 0, dateToSQLDate(at)]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Send Invite in Database' } as GenericError
    }
}

// get invites from a specified user
export async function dbGetInvitesFrom(from: string, type: number): Promise<[Invite[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            *
        FROM 
            invites 
        WHERE
            user_from = ?
        AND 
            invite_type = ?
        `
        const params: (string | number)[] = [from, type]
        const response: [Invite[], FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [Invite[], FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Fetch Invites From Database' } as GenericError
    }
}

// get invites using invite details
export async function dbGetInvitesByDetails(u_from: string, u_to: string, invite_to: string, type: number): Promise<[Invite[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            *
        FROM 
            invites 
        WHERE
            user_from = ?
        AND
            user_to = ?
        AND
            invite_to = ?
        AND 
            invite_type = ?
        `
        const params: (string | number)[] = [u_from, u_to, invite_to, type]
        const response: [Invite[], FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [Invite[], FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Fetch Invites From Database' } as GenericError
    }
}

// get all invites to a specified user by username
export async function dbGetInvitesTo(to_username: string): Promise<[Invite[], FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            *
        FROM 
            invites 
        WHERE
            user_to = (
                SELECT 
                    user_id
                FROM
                    users
                WHERE 
                    username = ?
            )
        `
        const params: (string | number)[] = [to_username]
        const response: [Invite[], FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [Invite[], FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Fetch Invites From Database' } as GenericError
    }
}

// accept an invite
export async function dbAcceptInvite(u_from: string, u_to: string, invite_to: string, type: number): Promise<[QueryResult, FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        UPDATE 
            invites
        SET 
            accepted = 1 
        WHERE
            user_from = ?
        AND
            user_to = ?
        AND
            invite_to = ?
        AND 
            invite_type = ?
        `
        const params: (string | number)[] = [u_from, u_to, invite_to, type]
        const response: [QueryResult, FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [QueryResult, FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Accept Invite In Database' } as GenericError
    }
}

// convert invites to their respective slug based on type
export async function dbInvitesToStateSlugs(invites: Invite[], type: number): Promise<StateInvite[] | GenericError> {
    if (invites.length === 0)
        return []

    // if (type === STATE_INVITE_CODE)
    try {
        const conn = await db.getConnection()

        const query: string = `
        SELECT 
            i.*,
            s.*, 
            c.*,
            cs.state_id AS congregation_state_id,
            cs.state_owner_id AS congregation_state_owner,
            cs.empire AS congregation_state_empire,
            cs.state_name AS congregation_state_name,
            cs.state_tax_rate AS congregation_state_tax_rate,
            us.first_name AS state_owner_first_name,
            us.last_name AS state_owner_last_name,
            uc.first_name AS congregation_owner_first_name,
            uc.last_name AS congregation_owner_last_name,
            ucs.first_name AS congregation_state_owner_first_name,
            ucs.last_name AS congregation_state_owner_last_name,
            uf.user_id AS user_from_user_id,
            uf.username AS user_from_username,
            uf.first_name AS user_from_first_name,
            uf.last_name AS user_from_last_name,
            ut.user_id AS user_to_user_id,
            ut.username AS user_to_username,
            ut.first_name AS user_to_first_name,
            ut.last_name AS user_to_last_name
        FROM 
            invites i 
        JOIN 
            congregations c ON i.invite_to = c.congregation_id
        JOIN 
            states cs ON c.state_id = cs.state_id
        LEFT JOIN
            states s ON i.invite_from = s.state_id
        LEFT JOIN 
            users us ON s.state_owner_id = us.user_id
        LEFT JOIN 
            users uc ON c.congregation_owner_id = uc.user_id 
        LEFT JOIN 
            users ucs ON cs.state_owner_id = ucs.user_id
        LEFT JOIN 
            users uf ON i.user_from = uf.user_id
        LEFT JOIN 
            users ut ON i.user_to = ut.user_id
        WHERE 
            i.user_from IN (${Array(invites.length).fill("?").join(', ')})
        AND 
            i.user_to IN (${Array(invites.length).fill("?").join(', ')})
        AND 
            i.invite_to IN (${Array(invites.length).fill("?").join(', ')})
        AND
            i.invite_type = ?
        `
        const params: (string | number | string[] | number[])[] = [
            ...invites.map(i => i.user_from),
            ...invites.map(i => i.user_to),
            ...invites.map(i => i.invite_to),
            type
        ]

        const response: [StateInviteMutable[], FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return stateInviteMutablesToSlugs((response as [StateInviteMutable[], FieldPacket[]])[0])
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Fetch Mutable Invite Data From Database' } as GenericError
    }
}

// delete (or decline) an invite using ids
export async function dbDeleteInvite(u_from: string, u_to: string, invite_to: string, type: number): Promise<[QueryResult, FieldPacket[]] | GenericError> {
    try {
        const conn = await db.getConnection()

        const query: string = `
        DELETE FROM 
            invites 
        WHERE
            user_from = ? 
        AND 
            user_to = ? 
        AND 
            invite_to = ?
        AND 
            invite_type = ?
        `
        const params: (string | number)[] = [u_from, u_to, invite_to, type]
        const response: [Invite[], FieldPacket[]] = await conn.execute(query, params)
        conn.release()

        return response as [Invite[], FieldPacket[]]
    } catch (error) {
        console.log(error)
        return { error: true, message: 'Failed to Delete Invite From Database' } as GenericError
    }
}