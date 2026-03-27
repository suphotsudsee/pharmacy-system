'use client';

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

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

  if (!mounted) {
    return (
      <nav className="bg-blue-700 text-white shadow-lg dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80">
                <span className="text-2xl">💊</span>
                <span className="font-bold text-lg hidden sm:inline">ระบบคลังยา</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const isAuthenticated = status === "authenticated" && session?.user;
  const userRole = (session?.user as any)?.role;

  return (
    <nav className="bg-blue-700 text-white shadow-lg dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80">
              <span className="text-2xl">💊</span>
              <span className="font-bold text-lg hidden sm:inline">ระบบคลังยา</span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/dashboard" className="hover:bg-blue-600 dark:hover:bg-gray-700 px-3 py-2 rounded">
                📊 Dashboard
              </Link>
              <Link href="/hospitals" className="hover:bg-blue-600 dark:hover:bg-gray-700 px-3 py-2 rounded">
                🏨 โรงพยาบาล
              </Link>
              <Link href="/drugs" className="hover:bg-blue-600 dark:hover:bg-gray-700 px-3 py-2 rounded">
                💊 รายการยา
              </Link>
              <Link href="/inventory" className="hover:bg-blue-600 dark:hover:bg-gray-700 px-3 py-2 rounded">
                📦 คลังยา
              </Link>
              <Link href="/requests" className="hover:bg-blue-600 dark:hover:bg-gray-700 px-3 py-2 rounded">
                📝 ใบเบิกยา
              </Link>
              <Link href="/import" className="hover:bg-blue-600 dark:hover:bg-gray-700 px-3 py-2 rounded">
                📥 นำเข้า
              </Link>
              {isAuthenticated && userRole === "ADMIN" && (
                <Link href="/settings" className="hover:bg-blue-600 dark:hover:bg-gray-700 px-3 py-2 rounded">
                  ⚙️ ตั้งค่า
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium">{session.user.name}</div>
                  <div className="text-xs opacity-75">
                    {roleLabels[userRole] || userRole}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-blue-600 hover:bg-blue-500 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-2 rounded text-sm transition-colors"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-500 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors"
              >
                🔐 เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden px-4 pb-2 space-y-1">
        <Link href="/dashboard" className="block py-1 hover:bg-blue-600 dark:hover:bg-gray-700 px-2 rounded">📊 Dashboard</Link>
        <Link href="/hospitals" className="block py-1 hover:bg-blue-600 dark:hover:bg-gray-700 px-2 rounded">🏥 โรงพยาบาล</Link>
        <Link href="/drugs" className="block py-1 hover:bg-blue-600 dark:hover:bg-gray-700 px-2 rounded">💊 รายการยา</Link>
        <Link href="/inventory" className="block py-1 hover:bg-blue-600 dark:hover:bg-gray-700 px-2 rounded">📦 คลังยา</Link>
        <Link href="/requests" className="block py-1 hover:bg-blue-600 dark:hover:bg-gray-700 px-2 rounded">📝 ใบเบิกยา</Link>
        <Link href="/import" className="block py-1 hover:bg-blue-600 dark:hover:bg-gray-700 px-2 rounded">📥 นำเข้า</Link>
        {isAuthenticated && userRole === "ADMIN" && (
          <Link href="/settings" className="block py-1 hover:bg-blue-600 dark:hover:bg-gray-700 px-2 rounded">⚙️ ตั้งค่า</Link>
        )}
      </div>
    </nav>
  );
}