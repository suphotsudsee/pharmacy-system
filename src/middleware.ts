import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths that require authentication
const protectedPaths = [
  // Create pages
  "/hospitals/new",
  "/drugs/new",
  "/inventory/new",
  "/requests/new",
  // Edit/Delete pages (detail pages with [id])
  "/hospitals/",
  "/drugs/",
  "/inventory/",
  "/requests/",
]

// Paths that are completely public (no auth needed)
const publicPaths = [
  "/login",
  "/api/auth",
  "/api/seed",
  "/api/seed-admin",
  "/api/fix",
  "/api/inventory/fix",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Allow static files and API
  if (
    pathname.startsWith("/_next") || 
    pathname.includes(".") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next()
  }

  // Check if path requires authentication
  // List pages (viewing) - no auth needed
  const listPages = ["/dashboard", "/hospitals", "/drugs", "/inventory", "/requests", "/import", "/"]
  
  // Check if it's a list page (exact match or ends with query params)
  const isListPage = listPages.some(page => pathname === page || pathname === page + "/")
  
  if (isListPage) {
    return NextResponse.next()
  }

  // All other pages (detail/edit/delete/new) require auth
  const needsAuth = protectedPaths.some(path => pathname.startsWith(path))
  
  if (needsAuth || !isListPage) {
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