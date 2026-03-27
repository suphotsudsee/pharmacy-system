import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Public paths - no auth needed
const publicPaths = [
  "/login",
  "/api/auth",
  "/api/seed",
  "/api/seed-admin",
  "/api/fix",
  "/api/inventory/fix",
]

// List pages - view only, no auth needed
const listPages = [
  "/dashboard",
  "/hospitals",
  "/drugs",
  "/inventory",
  "/requests",
  "/import",
  "/"
]

// CRUD paths - require authentication
const crudPaths = [
  "/hospitals/new",
  "/hospitals/",
  "/drugs/new",
  "/drugs/",
  "/inventory/new",
  "/inventory/",
  "/requests/new",
  "/requests/",
  "/settings",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 2. Allow static files
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next()
  }

  // 3. Allow API routes (auth checked in route handlers)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // 4. Allow list pages (view-only)
  const isListPage = listPages.some(page => 
    pathname === page || pathname === page + "/"
  )
  if (isListPage) {
    return NextResponse.next()
  }

  // 5. Check CRUD paths - require authentication
  const isCrudPath = crudPaths.some(path => pathname.startsWith(path))
  const isNewPage = pathname.includes("/new")
  const hasIdInPath = pathname.match(/\/(hospitals|drugs|inventory|requests|users)\/\d+/)
  
  const needsAuth = isCrudPath || isNewPage || hasIdInPath

  if (needsAuth) {
    // Check for session token in cookies
    const sessionToken = request.cookies.get("next-auth.session-token")?.value || 
                         request.cookies.get("__Secure-next-auth.session-token")?.value

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
}