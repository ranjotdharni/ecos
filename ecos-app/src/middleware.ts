import { API_SESSION_ROUTE, AUTH_CODES, AUTH_EXEMPT_ROUTES, AUTH_ROUTE, DEFAULT_SUCCESS_ROUTE, NEW_EMPIRE_ROUTE } from "./customs/utils/constants"
import { NextResponse, NextRequest } from "next/server"
import { GenericError } from "./customs/utils/types"
// import { isAuthenticated } from "./app/server/auth"

// pass current path as header to server
export async function middleware(request: NextRequest) {
  const pathname: string = request.nextUrl.pathname

  if (process.env.NEXT_PUBLIC_ENV !== 'dev' && !AUTH_EXEMPT_ROUTES.includes(pathname)) { // bypass for auth exempt routes and development mode
    // const status: number | GenericError = await isAuthenticated(`${process.env.NEXT_PUBLIC_ORIGIN}${API_SESSION_ROUTE}`)  // get auth status
    const status: number | GenericError = AUTH_CODES.NOT_AUTHENTICATED

    if (/*(status as GenericError).error &&*/ pathname !== AUTH_ROUTE)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}${(pathname !== DEFAULT_SUCCESS_ROUTE ? `?next=${pathname}` : ``)}`)

    if (status === AUTH_CODES.NOT_AUTHENTICATED && pathname !== AUTH_ROUTE) {   // not authenticated and not on auth route already
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}${(pathname !== DEFAULT_SUCCESS_ROUTE ? `?next=${pathname}` : ``)}`)
    }
    else if (status === AUTH_CODES.NULL_EMPIRE && pathname !== NEW_EMPIRE_ROUTE) {  // empire not selected and not on empire selection route
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NEW_EMPIRE_ROUTE}${(pathname !== DEFAULT_SUCCESS_ROUTE && pathname !== AUTH_ROUTE ? `?next=${pathname}` : ``)}`)
    }
    else if (status === AUTH_CODES.LOGGED_IN && (pathname === NEW_EMPIRE_ROUTE || pathname === AUTH_ROUTE)) {   // logged in but on an auth or empire select route
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${DEFAULT_SUCCESS_ROUTE}`)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // match all routes except static files and APIs
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}