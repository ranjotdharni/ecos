import UserProvider from "../components/context/UserProvider"
import { UserDetails } from "@/customs/utils/types"
import NavBar from "../components/navbar/NavBar"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function Layout({ children } : { children: React.ReactNode }) {

    const cookieList = await cookies()

    async function getUserDetails(): Promise<UserDetails> {
        if (process.env.ENV === 'dev')
            return {
                username: 'user1',
                firstname: 'Jane',
                lastname: 'Doe',
                empire: 1,
                gold: 9999.99
            }

        if (!cookieList.get('username') || !cookieList.get('token'))
            redirect(`${process.env.ORIGIN}/welcome`)

        const response = await fetch(`${process.env.ORIGIN}/api/user`, {   // contact api for db status check (because middleware on edge runtime can't query, smh why nextjs WHY?!?!)
            method: 'POST',
            body: JSON.stringify({
                username: cookieList.get('username')!.value,
                token: cookieList.get('token')!.value,
                key: process.env.API_KEY
            })
        })
    
        const result = await response.json()  // parse response

        if (result.error)
            redirect(`${process.env.ORIGIN}/welcome`)

        return result
    }

    return (
        <UserProvider userDetails={await getUserDetails()}>
            {/* Always leave 5vh at top of each page for navbar */}
            <NavBar />
            {children}
        </UserProvider>
    )
}