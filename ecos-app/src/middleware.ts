import { AUTH_CODES, AUTH_ROUTE, DEFAULT_SUCCESS_ROUTE, NEW_EMPIRE_ROUTE } from "./customs/utils/constants"
import { handleAuthentication } from "./app/server/auth"
import { NextResponse, NextRequest } from "next/server"

// pass current path as header to server
export async function middleware(request: NextRequest) {
  const origin: string = request.nextUrl.origin
  const pathname: string = request.nextUrl.pathname
  const status: number = await handleAuthentication(pathname)

  if (status === AUTH_CODES.NOT_AUTHENTICATED && pathname !== AUTH_ROUTE) {   // not authenticated and not on auth route already
    return NextResponse.redirect(`${origin}${AUTH_ROUTE}${(pathname !== DEFAULT_SUCCESS_ROUTE ? `?next=${pathname}` : ``)}`)
  }
  else if (status === AUTH_CODES.NULL_EMPIRE && pathname !== NEW_EMPIRE_ROUTE) {  // empire not selected and not on empire selection route
    return NextResponse.redirect(`${origin}${NEW_EMPIRE_ROUTE}${(pathname !== DEFAULT_SUCCESS_ROUTE ? `?next=${pathname}` : ``)}`)
  }
  else if (status === AUTH_CODES.LOGGED_IN && (pathname === NEW_EMPIRE_ROUTE || pathname === AUTH_ROUTE)) {   // logged in but on an auth or empire select route
    return NextResponse.redirect(`${origin}${DEFAULT_SUCCESS_ROUTE}`)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // match all routes except static files and APIs
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}