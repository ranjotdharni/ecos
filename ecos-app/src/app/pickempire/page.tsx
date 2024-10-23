'use server'

import Empire from "../components/empire/Empire"

export default async function PickEmpire({ searchParams } : { searchParams: { [key: string]: string | string[] | undefined } }) {

    return (
        <Empire urlParams={searchParams} />
    )
}