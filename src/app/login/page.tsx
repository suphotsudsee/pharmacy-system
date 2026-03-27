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
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
      } else {
        router.push(callbackUrl)
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {callbackUrl !== "/dashboard" && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อผู้ใช้
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="username"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          รหัสผ่าน
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
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
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div className="h-12 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div className="h-12 bg-gray-300 rounded dark:bg-gray-600"></div>
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