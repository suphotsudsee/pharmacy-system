'use client';

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useRouter } from "next/navigation";

/**
 * 🧭 Navbar Component - iOS Style
 * - Clean, minimal design
 * - Responsive mobile menu
 * - Smooth animations
 * - Dark mode support
 */
export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const roleLabels: Record<string, string> = {
    ADMIN: "ผู้ดูแลระบบ",
    PHARMACIST: "เภสัชกร",
    STAFF: "เจ้าหน้าที่",
    VIEWER: "ผู้ดู",
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  // Navigation items - รายการเมนูหลัก
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/hospitals", label: "โรงพยาบาล", icon: "🏥" },
    { href: "/drugs", label: "รายการยา", icon: "💊" },
    { href: "/inventory", label: "คลังยา", icon: "📦" },
    { href: "/requests", label: "ใบเบิกยา", icon: "📝" },
    { href: "/import", label: "นำเข้า", icon: "📥" },
  ];

  // Loading skeleton
  if (!mounted) {
    return (
      <nav className="navbar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💊</span>
                <span className="font-semibold hidden sm:inline">ระบบคลังยา</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-20 h-8 bg-surface-secondary rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const isAuthenticated = status === "authenticated" && session?.user;
  const userRole = (session?.user as any)?.role;

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-14">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 group"
            >
              <span className="text-2xl transition-transform group-hover:scale-110">
                💊
              </span>
              <span className="font-semibold hidden sm:inline transition-colors group-hover:text-primary">
                ระบบคลังยา
              </span>
            </Link>

            {/* Desktop Navigation - iOS-style */}
            <div className="hidden md:flex items-center ml-6 gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`navbar-link flex items-center gap-1.5 text-sm ${
                      isActive ? 'active' : ''
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {isAuthenticated && userRole === "ADMIN" && (
                <Link 
                  href="/settings" 
                  className={`navbar-link flex items-center gap-1.5 text-sm ${
                    pathname === '/settings' ? 'active' : ''
                  }`}
                >
                  <span>⚙️</span>
                  <span>ตั้งค่า</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* User Info - Desktop */}
                <div className="hidden sm:block text-right mr-2">
                  <div className="text-sm font-medium text-primary">
                    {session.user.name}
                  </div>
                  <div className="text-xs text-secondary">
                    {roleLabels[userRole] || userRole}
                  </div>
                </div>

                {/* Sign Out Button - iOS Style */}
                <button
                  onClick={handleSignOut}
                  className="btn btn-outline text-sm"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary text-sm"
              >
                <span>🔐</span>
                <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                <span className="sm:hidden">เข้าสู่ระบบ</span>
              </Link>
            )}

            {/* Mobile Menu Button - iOS Style */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-secondary transition-colors"
              aria-label="เปิดเมนู"
            >
              <svg
                className={`w-6 h-6 transition-transform ${
                  mobileMenuOpen ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - iOS Action Sheet Style */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-0.5 bg-surface dark:bg-surface-secondary border-t border-separator">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-bg text-primary font-medium' 
                    : 'hover:bg-surface-secondary dark:hover:bg-surface'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          {isAuthenticated && userRole === "ADMIN" && (
            <Link
              href="/settings"
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                pathname === '/settings'
                  ? 'bg-primary-bg text-primary font-medium'
                  : 'hover:bg-surface-secondary dark:hover:bg-surface'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-lg">⚙️</span>
              <span>ตั้งค่า</span>
            </Link>
          )}

          {/* Mobile User Info - iOS Style */}
          {isAuthenticated && (
            <div className="pt-2 mt-2 border-t border-separator">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="avatar">
                  <span className="text-sm">👤</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-primary">{session.user.name}</div>
                  <div className="text-xs text-secondary">
                    {roleLabels[userRole] || userRole}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}