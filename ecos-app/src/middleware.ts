import { API_SESSION_ROUTE, AUTH_CODES, AUTH_EXEMPT_ROUTES, AUTH_ROUTE, DEFAULT_SUCCESS_ROUTE, NEW_EMPIRE_ROUTE } from "./customs/utils/constants"
import { NextResponse, NextRequest } from "next/server"
import { cookies } from "next/headers"

// pass current path as header to server
export async function middleware(request: NextRequest) {
  const pathname: string = request.nextUrl.pathname

  if (process.env.NEXT_PUBLIC_ENV !== 'dev' && !AUTH_EXEMPT_ROUTES.includes(pathname)) { // bypass for auth exempt routes and development mode
    // const status: number | GenericError = await isAuthenticated(`${process.env.NEXT_PUBLIC_ORIGIN}${API_SESSION_ROUTE}`)  // get auth status
    let status: number = AUTH_CODES.NOT_AUTHENTICATED

    // check authentication
    const cookieList = cookies()

    if (!cookieList.has('username') || !cookieList.has('token'))    // session cookies not found
        status = AUTH_CODES.NOT_AUTHENTICATED
    else {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_SESSION_ROUTE}`, {   // contact api for db status check (because middleware on edge runtime can't query, smh why nextjs WHY?!?!)
          method: 'POST',
          body: JSON.stringify({
              username: cookieList.get('username')!.value,
              token: cookieList.get('token')!.value,
              key: process.env.API_KEY
          })
      })

      const data = await response.json()  // parse response

      if (data.error)
        status = AUTH_CODES.NOT_AUTHENTICATED
      else
        status = data.session as number // return status
    }

    /*if ((status as GenericError).error && pathname !== AUTH_ROUTE)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}${(pathname !== DEFAULT_SUCCESS_ROUTE ? `?next=${pathname}` : ``)}`)

    if (status === AUTH_CODES.NOT_AUTHENTICATED && pathname !== AUTH_ROUTE) {   // not authenticated and not on auth route already
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}${(pathname !== DEFAULT_SUCCESS_ROUTE ? `?next=${pathname}` : ``)}`)
    }
    else if (status === AUTH_CODES.NULL_EMPIRE && pathname !== NEW_EMPIRE_ROUTE) {  // empire not selected and not on empire selection route
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${NEW_EMPIRE_ROUTE}${(pathname !== DEFAULT_SUCCESS_ROUTE && pathname !== AUTH_ROUTE ? `?next=${pathname}` : ``)}`)
    }
    else if (status === AUTH_CODES.LOGGED_IN && (pathname === NEW_EMPIRE_ROUTE || pathname === AUTH_ROUTE)) {   // logged in but on an auth or empire select route
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${DEFAULT_SUCCESS_ROUTE}`)
    }*/

      // Handle redirects properly to avoid infinite loops
    const isOnAuthRoute = pathname === AUTH_ROUTE;
    const isOnEmpireRoute = pathname === NEW_EMPIRE_ROUTE;
    // const isOnSuccessRoute = pathname === DEFAULT_SUCCESS_ROUTE;

    if (status === AUTH_CODES.NOT_AUTHENTICATED) {
      // Only redirect if not already on the auth route
      if (!isOnAuthRoute) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_ORIGIN}${AUTH_ROUTE}${pathname !== DEFAULT_SUCCESS_ROUTE ? `?next=${pathname}` : ''}`
        );
      }
    } else if (status === AUTH_CODES.NULL_EMPIRE) {
      // Only redirect if not already on the empire selection route
      if (!isOnEmpireRoute) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_ORIGIN}${NEW_EMPIRE_ROUTE}${(pathname !== DEFAULT_SUCCESS_ROUTE && !isOnAuthRoute) ? `?next=${pathname}` : ''}`
        );
      }
    } else if (status === AUTH_CODES.LOGGED_IN) {
      // Redirect to success page if logged in and on auth or empire selection routes
      if (isOnAuthRoute || isOnEmpireRoute) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${DEFAULT_SUCCESS_ROUTE}`);
      }
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