'use client'

import { FormEvent, MouseEvent, useState } from "react"
import styles from './auth.module.css'
import useError from "@/customs/hooks/useError"
import { userAuthenticate } from "@/app/server/auth"

// Auth forms submit slug
export interface AuthFormSlug {
    username: string
    password: string
    confirm?: string
}

// individual Auth form props
interface AuthFormProps {
    swap: (event: MouseEvent<HTMLButtonElement>) => void
    submit: (slug: AuthFormSlug) => void
    error?: string
}

// Create a new user account
export function UserCreateForm(props : AuthFormProps) {

    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [confirm, setConfirm] = useState<string>('')

    function editUsername(event: FormEvent<HTMLInputElement>) {
        setUsername(event.currentTarget.value)
    }

    function editPassword(event: FormEvent<HTMLInputElement>) {
        setPassword(event.currentTarget.value)
    }

    function editConfirm(event: FormEvent<HTMLInputElement>) {
        setConfirm(event.currentTarget.value)
    }

    function submit(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (username.trim() === '' || password.trim() === '' || confirm.trim() === '')  // ensure no fields are empty
            return

        props.submit({
            username: username.trim(),
            password: password.trim(),
            confirm: confirm.trim()
        })
    }

    return (
        <form className={styles.form}>
            <h2>Welcome - Create Account</h2>

            <label>Username</label>
            <input placeholder='Enter Username...' onChange={editUsername} />

            <label>Password</label>
            <input type='password' placeholder='Enter Password...' onChange={editPassword} />

            <label>Confirm Password</label>
            <input type='password' placeholder='Re-enter Password...' onChange={editConfirm} />

            <div className={styles.footer}>
                <p>{props.error}</p>
                <div>
                    <button onClick={submit}>Submit</button>
                    <button onClick={props.swap}>Returning User</button>
                </div>
            </div>
        </form>
    )
}

// Log in an existing user account
export function UserLoginForm(props: AuthFormProps) {

    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    function editUsername(event: FormEvent<HTMLInputElement>) {
        setUsername(event.currentTarget.value)
    }

    function editPassword(event: FormEvent<HTMLInputElement>) {
        setPassword(event.currentTarget.value)
    }

    function submit(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        if (username.trim() === '' || password.trim() === '') // ensure no fields are empty
            return

        props.submit({
            username: username.trim(),
            password: password.trim()
        })
    }

    return (
        <form className={styles.form}>
            <h2>Existing User - Log In</h2>

            <label>Username</label>
            <input placeholder='Enter Username...' onChange={editUsername} />

            <label>Password</label>
            <input type='password' placeholder='Enter Password...' onChange={editPassword} />

            <label></label>
            <input hidden />

            <div className={styles.footer}>
                <p>{props.error}</p>
                <div>
                    <button onClick={submit}>Submit</button>
                    <button onClick={props.swap}>New User</button>
                </div>
            </div>
        </form>
    )
}

// Authenticate a user
export default function AuthForm({ urlParams } : { urlParams: { [key: string]: string | string[] | undefined } }) {
    const [newUser, setNewUser] = useState<boolean>(true) // track create form vs login form
    const [error, throwError] = useError()

    // pass up form data for credential authentication
    async function authenticate(slug: AuthFormSlug) {
        await userAuthenticate(newUser, slug, urlParams).then(error => {
            if (error)
                throwError(error)
        })
    }

    // switch between create and login form
    function swapForm(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setNewUser(!newUser)
    }

    return (
        newUser ? <UserCreateForm swap={swapForm} submit={authenticate} error={error} /> : <UserLoginForm swap={swapForm} submit={authenticate} error={error} />
    )
}