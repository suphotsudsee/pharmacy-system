'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Hospital {
  id: number;
  hospCode: string;
  name: string;
  shortName: string | null;
  province: { name: string } | null;
  facilityType: { name: string } | null;
  serviceLevel: { name: string } | null;
  _count: { drugInventories: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function HospitalsPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, [pagination.page]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/hospitals?${params}`);
      const data = await res.json();
      if (data.success) {
        setHospitals(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchHospitals();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🏥 โรงพยาบาล</h1>
        {isAuthenticated && (
          <Link
            href="/hospitals/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            + เพิ่มโรงพยาบาล
          </Link>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาโรงพยาบาล..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            ค้นหา
          </button>
        </div>
      </form>

      {/* Stats */}
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
        <div className="text-sm text-blue-800 dark:text-blue-300">
          จำนวนโรงพยาบาลทั้งหมด: <span className="font-bold">{pagination.total}</span> แห่ง
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">กำลังโหลด...</div>
        ) : hospitals.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">ไม่พบข้อมูล</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">รหัส</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อโรงพยาบาล</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">จังหวัด</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ประเภท</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">คลังยา</th>
                {isAuthenticated && (
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">การจัดการ</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {hospitals.map((hospital) => (
                <tr key={hospital.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{hospital.hospCode}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{hospital.name}</div>
                    {hospital.shortName && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{hospital.shortName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{hospital.province?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{hospital.facilityType?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{hospital._count.drugInventories}</td>
                  {isAuthenticated && (
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/hospitals/${hospital.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        ดู
                      </Link>
                      <Link
                        href={`/hospitals/${hospital.id}`}
                        className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 mr-3"
                      >
                        แก้ไข
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
          >
            ก่อนหน้า
          </button>
          <span className="px-4 py-2 dark:text-gray-300">
            หน้า {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
          >
            ถัดไป
          </button>
        </div>
      )}

      <div className="mt-6">
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          ← กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}