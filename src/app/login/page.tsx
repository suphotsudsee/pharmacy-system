'use client';

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signIn("credentials", {
        username,
        password,
        redirect: true,
        callbackUrl,
      })
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {callbackUrl !== "/dashboard" && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg text-sm">
          กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          ชื่อผู้ใช้
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="username"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          รหัสผ่าน
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="••••••••"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังเข้าสู่ระบบ...
          </span>
        ) : (
          "เข้าสู่ระบบ"
        )}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md dark:bg-gray-800">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💊</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ระบบคลังยา</h1>
          <p className="text-gray-500 mt-2 dark:text-gray-400">เข้าสู่ระบบเพื่อจัดการข้อมูล</p>
        </div>

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">กำลังโหลด...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">ผู้ใช้ทดสอบ:</p>
          <div className="bg-gray-50 rounded-lg p-3 text-left dark:bg-gray-700">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600 dark:text-gray-300">ผู้ดูแลระบบ:</span>
              <code className="bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded text-xs">admin / admin123</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">เภสัชกร:</span>
              <code className="bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded text-xs">pharmacist / pharm123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}