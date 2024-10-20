'use server'

import AuthForm from "../components/auth/AuthForm"

export default async function Welcome({ searchParams } : { searchParams: { [key: string]: string | string[] | undefined } }) {

    return (
        <AuthForm urlParams={searchParams} />
    )
}