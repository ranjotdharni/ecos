import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { handleAuthentication } from "./app/server/auth";

export async function middleware(request: NextRequest) {
  // Log the current request pathname
  const headers = new Headers(request.headers)
  headers.set("current-path", request.nextUrl.pathname)
  return NextResponse.next({ headers })
}

export const config = {
  matcher: [
    // match all routes except static files and APIs
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
