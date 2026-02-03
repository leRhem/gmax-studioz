// middleware.ts
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PAGE_PERMISSIONS } from "@/lib/permissions"
import type { StaffRole } from "@/lib/generated/prisma"

/**
 * Check if the user has access to the given path based on their role
 */
function hasAccess(userRole: StaffRole, pathname: string): boolean {
  // Find the most specific matching route
  const matchingRoutes = Object.keys(PAGE_PERMISSIONS)
    .filter((route) => pathname === route || pathname.startsWith(route + "/"))
    .sort((a, b) => b.length - a.length) // Sort by specificity (longest first)

  if (matchingRoutes.length === 0) {
    // No specific permission defined - allow access
    return true
  }

  const allowedRoles = PAGE_PERMISSIONS[matchingRoutes[0]]
  return allowedRoles.includes(userRole)
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes that don't require authentication
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/public") || // Public APIs for booking (includes rescheduling)
    pathname.startsWith("/api/receipt") || // Public API for receipt
    pathname.startsWith("/book") || // Public booking page
    pathname.startsWith("/confirm") || // Booking confirmation page
    pathname.startsWith("/delivery") || // Photo delivery portal
    pathname.startsWith("/pay") || // Public payment page
    pathname.startsWith("/receipt") || // Public receipt page
    pathname.startsWith("/academy") || // Public academy page
    pathname.startsWith("/works") || // Public portfolio
    pathname.startsWith("/store") // Public store

  // Check if this is an API route (protected API routes handle their own auth)
  const isApiRoute = pathname.startsWith("/api/")

  // If not logged in and trying to access protected route
  if (!isLoggedIn && !isPublicRoute) {
    // For API routes, return 401 JSON response instead of redirect
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // For page routes, redirect to login
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If logged in and trying to access login page
  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Role-based access control (only if logged in and on dashboard routes)
  if (isLoggedIn && req.auth?.user && pathname.startsWith("/dashboard")) {
    const userRole = req.auth.user.role as StaffRole

    if (!hasAccess(userRole, pathname)) {
      // Redirect to dashboard with unauthorized flag for toast
      const dashboardUrl = new URL("/dashboard", req.url)
      dashboardUrl.searchParams.set("unauthorized", "true")
      dashboardUrl.searchParams.set("attempted", pathname)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, logo.png (public files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
