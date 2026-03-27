'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Drug {
  id: number;
  drugCode: string;
  name: string;
  genericName: string | null;
  category: { name: string } | null;
  dosageForm: string | null;
  strength: string | null;
  unit: string;
  minStock: number;
  maxStock: number | null;
  reorderPoint: number;
  unitPrice: number | null;
  isActive: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DrugsPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchDrugs();
  }, [pagination.page]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/drug-categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDrugs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);

      const res = await fetch(`/api/drugs?${params}`);
      const data = await res.json();
      if (data.success) {
        setDrugs(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching drugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDrugs();
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    INACTIVE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">💊 รายการยา</h1>
        {isAuthenticated && (
          <Link
            href="/drugs/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            + เพิ่มยา
          </Link>
        )}
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหายา..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">ทุกหมวด</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
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
          จำนวนรายการยาทั้งหมด: <span className="font-bold">{pagination.total}</span> รายการ
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">กำลังโหลด...</div>
        ) : drugs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">ไม่พบข้อมูล</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">รหัส</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อยา</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">หมวด</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">รูปแบบ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">หน่วย</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">จุดสั่งซื้อ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">สถานะ</th>
                {isAuthenticated && (
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">การจัดการ</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {drugs.map((drug) => (
                <tr key={drug.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{drug.drugCode}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{drug.name}</div>
                    {drug.genericName && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{drug.genericName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{drug.category?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{drug.dosageForm || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{drug.unit}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{drug.reorderPoint.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${drug.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {drug.isActive ? 'ใช้งาน' : 'ปิดการใช้งาน'}
                    </span>
                  </td>
                  {isAuthenticated && (
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/drugs/${drug.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        ดู
                      </Link>
                      <Link
                        href={`/drugs/${drug.id}`}
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