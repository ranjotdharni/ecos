import NavBar from "../components/navbar/NavBar"

export default async function Layout({ children } : { children: React.ReactNode }) {

    return (
        <>
            {/* Always leave 5vh at top of each page for navbar */}
            <NavBar />
            {children}
        </>
    )
}