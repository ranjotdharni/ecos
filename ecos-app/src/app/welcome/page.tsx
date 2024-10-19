'use server'

import AuthForm, { AuthFormSlug } from "../components/auth/AuthForm"
import { validatePassword, validateUsername } from "../server/auth"

export async function userAuthenticate(isNewUser: boolean, details: AuthFormSlug) {
    if (isNewUser) {    // create new user

        // validate username
        if (details.username === details.password)
            return 'Username may not match password'

        const invalidUsername: string | void = validateUsername(details.username)

        if (invalidUsername)
            return invalidUsername

        // validate password
        if (details.password !== details.confirm) {
            return 'Passwords must match'
        }

        const invalidPassword: string | void = validatePassword(details.password)

        if (invalidPassword)
            return invalidPassword

        // add user and redirect
        console.log(details)
    }
    else {  // log in existing user

        console.log(details)
    }
}

export default async function Welcome() {

    return (
        <AuthForm />
    )
}