import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths that are completely public (no auth needed)
const publicPaths = [
  "/login",
  "/api/auth",
  "/api/seed",
  "/api/seed-admin",
  "/api/fix",
  "/api/inventory/fix",
]

// List pages that are view-only (no auth needed)
const listPages = ["/dashboard", "/hospitals", "/drugs", "/inventory", "/requests", "/import", "/"]

// CRUD paths that require authentication
const crudPaths = [
  "/hospitals/new",
  "/drugs/new",
  "/inventory/new",
  "/requests/new",
  "/settings/users/new",
  "/settings/users/",
  "/settings/",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Allow static files
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next()
  }

  // Allow API routes (auth is checked in the API route itself)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Allow list pages (view-only, no auth needed)
  const isListPage = listPages.some(page => pathname === page || pathname === page + "/")
  if (isListPage) {
    return NextResponse.next()
  }

  // Check if path requires authentication (CRUD operations)
  // /new, /[id], /settings
  const isNewPage = pathname.includes("/new")
  const hasIdInPath = pathname.match(/\/(hospitals|drugs|inventory|requests|users)\/\d+/)
  const isCrudPath = crudPaths.some(path => pathname.startsWith(path))
  
  const needsAuth = isNewPage || hasIdInPath || isCrudPath

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