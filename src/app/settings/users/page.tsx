'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface User {
  id: number;
  username: string;
  email: string | null;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.error || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`ต้องการลบผู้ใช้ "${username}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert(data.error || 'ไม่สามารถลบผู้ใช้ได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const roleLabels: Record<string, string> = {
    ADMIN: 'ผู้ดูแลระบบ',
    PHARMACIST: 'เภสัชกร',
    STAFF: 'เจ้าหน้าที่',
    VIEWER: 'ผู้ดู',
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    PHARMACIST: 'bg-blue-100 text-blue-800',
    STAFF: 'bg-green-100 text-green-800',
    VIEWER: 'bg-gray-100 text-gray-800',
  };

  // Check if user is admin
  if (status === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-8">กำลังโหลด...</div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-red-800 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-red-600">เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถจัดการผู้ใช้ได้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">👥 จัดการผู้ใช้</h1>
          <p className="text-gray-600 mt-1">เพิ่ม แก้ไข ลบ ผู้ใช้งานระบบ</p>
        </div>
        <button
          onClick={() => router.push('/settings/users/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ➕ เพิ่มผู้ใช้
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ค้นหา</label>
            <input
              type="text"
              placeholder="ค้นหาชื่อ, username, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">บทบาท</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="ADMIN">ผู้ดูแลระบบ</option>
              <option value="PHARMACIST">เภสัชกร</option>
              <option value="STAFF">เจ้าหน้าที่</option>
              <option value="VIEWER">ผู้ดู</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setSearchTerm(''); setRoleFilter(''); }}
              className="w-full border rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              🔄 รีเซ็ต
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          ❌ {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">กำลังโหลด...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            ไม่พบผู้ใช้
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">ชื่อ</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Username</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">บทบาท</th>
                <th className="px-4 py-3 text-left text-sm font-medium">สถานะ</th>
                <th className="px-4 py-3 text-right text-sm font-medium">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{user.fullName}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.username}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-100'}`}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? '✅ ใช้งาน' : '❌ ปิดการใช้งาน'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => router.push(`/settings/users/${user.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="แก้ไข"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.username)}
                        className="text-red-600 hover:text-red-800"
                        title="ลบ"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Back Link */}
      <div className="mt-6">
        <a href="/settings" className="text-blue-600 hover:underline">
          ← กลับหน้าตั้งค่า
        </a>
      </div>
    </div>
  );
}