'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface InventoryItem {
  id: number;
  drug: { id: number; drugCode: string; name: string; unit: string; reorderPoint: number; minStock: number };
  hospital: { id: number; name: string };
  lotNumber: string | null;
  expiryDate: string | null;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  location: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hospitals, setHospitals] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchHospitals();
    fetchInventory();
  }, [pagination.page]);

  const fetchHospitals = async () => {
    try {
      const res = await fetch('/api/hospitals?limit=1000');
      const data = await res.json();
      if (data.success) {
        setHospitals(data.data);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (search) params.set('search', search);
      if (hospitalFilter) params.set('hospitalId', hospitalFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/inventory?${params}`);
      const data = await res.json();
      if (data.success) {
        setInventory(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchInventory();
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return { status: 'OUT_OF_STOCK', label: 'หมดสต็อก', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
    if (item.currentStock <= item.drug.minStock) return { status: 'LOW_STOCK', label: 'ใกล้หมด', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' };
    if (item.currentStock <= item.drug.reorderPoint) return { status: 'REORDER', label: 'สั่งซื้อ', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
    return { status: 'NORMAL', label: 'ปกติ', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const sixMonths = new Date(now.setMonth(now.getMonth() + 6));
    return expiry <= sixMonths;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📦 คลังยา</h1>
        {isAuthenticated && (
          <Link
            href="/inventory/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            + เพิ่มสต็อกยา
          </Link>
        )}
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหายา..."
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">ทุกโรงพยาบาล</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">ทุกสถานะ</option>
            <option value="OUT_OF_STOCK">หมดสต็อก</option>
            <option value="LOW_STOCK">ใกล้หมด</option>
            <option value="REORDER">ต้องสั่งซื้อ</option>
            <option value="NORMAL">ปกติ</option>
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
          จำนวนรายการทั้งหมด: <span className="font-bold">{pagination.total}</span> รายการ
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">กำลังโหลด...</div>
        ) : inventory.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">ไม่พบข้อมูล</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">โรงพยาบาล</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ยา</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">สต็อก</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">สถานะ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">หมดอายุ</th>
                {isAuthenticated && (
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">การจัดการ</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {inventory.map((item) => {
                const stockStatus = getStockStatus(item);
                const expiring = isExpiringSoon(item.expiryDate);
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.hospital.name}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{item.drug.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.drug.drugCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 dark:text-white">{item.currentStock.toLocaleString()} {item.drug.unit}</div>
                      {item.reservedStock > 0 && (
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">จอง: {item.reservedStock.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.expiryDate ? (
                        <span className={expiring ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}>
                          {new Date(item.expiryDate).toLocaleDateString('th-TH')}
                          {expiring && ' ⚠️'}
                        </span>
                      ) : '-'}
                    </td>
                    {isAuthenticated && (
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/inventory/${item.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        >
                          ดู
                        </Link>
                        <Link
                          href={`/inventory/${item.id}`}
                          className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 mr-3"
                        >
                          แก้ไข
                        </Link>
                      </td>
                    )}
                  </tr>
                );
              })}
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