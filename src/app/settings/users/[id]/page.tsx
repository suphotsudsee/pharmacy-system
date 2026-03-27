'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface User {
  id: number;
  username: string;
  email: string | null;
  fullName: string;
  role: string;
  isActive: boolean;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { data: session, status } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    role: 'STAFF',
    isActive: true,
  });

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();

      if (data.success) {
        const user = data.data;
        setFormData({
          username: user.username,
          password: '',
          confirmPassword: '',
          email: user.email || '',
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive,
        });
      } else {
        setError(data.error || 'ไม่พบผู้ใช้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.username || !formData.fullName) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      setSaving(true);
      const body: any = {
        username: formData.username,
        email: formData.email || null,
        fullName: formData.fullName,
        role: formData.role,
        isActive: formData.isActive,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/settings/users');
      } else {
        setError(data.error || 'ไม่สามารถอัปเดตผู้ใช้ได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการอัปเดตผู้ใช้');
    } finally {
      setSaving(false);
    }
  };

  // Check if user is admin
  if (status === 'loading' || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-8">กำลังโหลด...</div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-red-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-red-600">เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขผู้ใช้ได้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">✏️ แก้ไขผู้ใช้</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">รหัสผ่านใหม่</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="เว้นว่างถ้าไม่ต้องการเปลี่ยน"
            minLength={6}
          />
          <p className="text-xs text-gray-500 mt-1">อย่างน้อย 6 ตัวอักษร (เว้นว่างถ้าไม่ต้องการเปลี่ยน)</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ยืนยันรหัสผ่านใหม่</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="เว้นว่างถ้าไม่ต้องการเปลี่ยน"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ชื่อ-นามสกุล</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">บทบาท</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
            <option value="PHARMACIST">เภสัชกร (PHARMACIST)</option>
            <option value="STAFF">เจ้าหน้าที่ (STAFF)</option>
            <option value="VIEWER">ผู้ดู (VIEWER)</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm font-medium">
            เปิดใช้งาน
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border py-2 rounded-lg hover:bg-gray-50"
          >
            ❌ ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}