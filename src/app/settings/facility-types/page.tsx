'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface FacilityType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  _count: { hospitals: number };
}

export default function FacilityTypesPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFacilityTypes();
  }, []);

  const fetchFacilityTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/facility-types');
      const data = await res.json();
      if (data.success) {
        setFacilityTypes(data.data);
      }
    } catch (error) {
      console.error('Error fetching facility types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบประเภทสถานบริการนี้ใช่หรือไม่?')) return;

    try {
      const res = await fetch(`/api/facility-types/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFacilityTypes(facilityTypes.filter(f => f.id !== id));
      } else {
        alert(data.error || 'ไม่สามารถลบได้');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const filteredFacilityTypes = facilityTypes.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.code.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-red-600 dark:text-red-400">เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถจัดการข้อมูลได้</p>
          <Link href="/settings" className="mt-4 inline-block text-blue-600 hover:underline">
            ← กลับหน้าตั้งค่า
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">🏨 จัดการประเภทสถานบริการ</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">จัดการประเภทโรงพยาบาล (รพ., รพ.สต., รพช.)</p>
        </div>
        {isAuthenticated && (
          <Link
            href="/settings/facility-types/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            + เพิ่มประเภท
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาประเภท..."
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">กำลังโหลด...</div>
        ) : filteredFacilityTypes.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">ไม่พบข้อมูล</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">รหัส</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อประเภท</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">คำอธิบาย</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">โรงพยาบาล</th>
                {isAuthenticated && (
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">การจัดการ</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFacilityTypes.map((facilityType) => (
                <tr key={facilityType.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{facilityType.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{facilityType.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{facilityType.description || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{facilityType._count.hospitals}</td>
                  {isAuthenticated && (
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/settings/facility-types/${facilityType.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => handleDelete(facilityType.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        ลบ
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6">
        <Link href="/settings" className="text-blue-600 hover:underline dark:text-blue-400">
          ← กลับหน้าตั้งค่า
        </Link>
      </div>
    </div>
  );
}