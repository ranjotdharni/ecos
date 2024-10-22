'use client'

import { FormEvent, MouseEvent, useState } from "react"
import { userAuthenticate } from "@/app/server/auth"
import { AuthFormSlug } from "@/customs/utils/types"
import useError from "@/customs/hooks/useError"
import styles from './auth.module.css'

// individual Auth form props
export interface AuthFormProps {
    swap: (event: MouseEvent<HTMLAnchorElement>) => void
    submit: (slug: AuthFormSlug) => void
    error?: string
}

// Create a new user account
export function UserCreateForm(props : AuthFormProps) {

    const [firstname, setFirstname] = useState<string>('')
    const [lastname, setLastname] = useState<string>('')
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [confirm, setConfirm] = useState<string>('')

    function editFirstname(event: FormEvent<HTMLInputElement>) {
        setFirstname(event.currentTarget.value)
    }

    function editLastname(event: FormEvent<HTMLInputElement>) {
        setLastname(event.currentTarget.value)
    }

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
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            username: username.trim(),
            password: password.trim(),
            confirm: confirm.trim()
        })
    }

    return (
        <form className={styles.form}>
            <h1>Sign Up</h1>
            <h3>Create an account</h3>

            <section>
                <input placeholder='First Name' onChange={editFirstname} />
                <input placeholder='Last Name' onChange={editLastname} />
            </section>

            <input placeholder='Username' onChange={editUsername} />
            <input type='password' placeholder='Password' onChange={editPassword} />
            <input type='password' placeholder='Confirm Password' onChange={editConfirm} />

            
            <button onClick={submit}>Submit</button>
            <p className={styles.swap}>Already a user? <a onClick={props.swap}>Log In</a></p>
            <p className={styles.error}>{props.error}</p>
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
            <h1>Log In</h1>
            <h3>Sign into your account</h3>

            <input placeholder='Username' onChange={editUsername} />
            <input type='password' placeholder='Password' onChange={editPassword} />
            <input className={styles.hidden} disabled  />

            
            <button onClick={submit}>Submit</button>
            <p className={styles.swap}>Not a user? <a onClick={props.swap}>Sign Up</a></p>
            <p className={styles.error}>{props.error}</p>
        </form>
    )
}

// Authenticate a user
export default function AuthForm({ urlParams } : { urlParams: { [key: string]: string | string[] | undefined } }) {
    const [newUser, setNewUser] = useState<boolean>(true) // track create form vs login form
    const [error, throwError] = useError()

    // pass up form data for credential authentication
    async function authenticate(slug: AuthFormSlug) {
        // apparently getTimezoneOffset give positive value if behind utc time
        await userAuthenticate(newUser, slug, urlParams).then(error => {
            if (error)
                throwError(error)
        })
    }

    // switch between create and login form
    function swapForm(event: MouseEvent<HTMLAnchorElement>) {
        event.preventDefault()
        setNewUser(!newUser)
    }

    return (
        <section className={styles.page}>
            {newUser ? <UserCreateForm swap={swapForm} submit={authenticate} error={error} /> : <UserLoginForm swap={swapForm} submit={authenticate} error={error} />}
        </section>
    )
}