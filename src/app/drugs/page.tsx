'use client';

import { useState, useEffect } from 'react';

interface Drug {
  id: number;
  drugCode: string;
  name: string;
  genericName: string | null;
  dosageForm: string | null;
  strength: string | null;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitPrice: number | null;
  category: { id: number; name: string } | null;
  isActive: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DrugsPage() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchDrugs();
  }, [pagination.page, showInactive]);

  const fetchDrugs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/drugs?${params}`);
      const data = await res.json();
      if (data.success) {
        setDrugs(showInactive ? data.data : data.data.filter((d: Drug) => d.isActive));
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

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`คุณต้องการลบ "${name}" หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/drugs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message || 'ลบรายการยาเรียบร้อยแล้ว');
        fetchDrugs();
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error deleting drug:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">💊 รายการยา</h1>
        <a
          href="/drugs/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + เพิ่มยาใหม่
        </a>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหายา (รหัส, ชื่อ, ชื่อสามัญ)..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              ค้นหา
            </button>
          </form>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">แสดงยาที่ไม่ใช้งาน</span>
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <div className="text-sm text-green-800">
          จำนวนรายการยา: <span className="font-bold">{pagination.total}</span> รายการ
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">รหัส</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ชื่อยา</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">หมวด</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">รูปแบบ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">หน่วย</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">สต็อก</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ราคา</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">สถานะ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : drugs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    ไม่พบรายการยา
                  </td>
                </tr>
              ) : (
                drugs.map((drug) => (
                  <tr key={drug.id} className={`hover:bg-gray-50 ${!drug.isActive ? 'bg-gray-100' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {drug.drugCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{drug.name}</div>
                      {drug.genericName && (
                        <div className="text-sm text-gray-500">{drug.genericName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {drug.category?.name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{drug.dosageForm || '-'}</td>
                    <td className="px-4 py-3">{drug.unit}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>ขั้นต่ำ: {drug.minStock}</div>
                        <div className="text-gray-500">สูงสุด: {drug.maxStock}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {drug.unitPrice ? `฿${drug.unitPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {drug.isActive ? (
                        <span className="text-green-600 text-sm">ใช้งาน</span>
                      ) : (
                        <span className="text-red-600 text-sm">ไม่ใช้งาน</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <a
                          href={`/drugs/${drug.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          ดู
                        </a>
                        <a
                          href={`/drugs/${drug.id}`}
                          className="text-yellow-600 hover:underline text-sm"
                        >
                          แก้ไข
                        </a>
                        <button
                          onClick={() => handleDelete(drug.id, drug.name)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
            <div className="text-sm text-gray-500">
              หน้า {pagination.page} จาก {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-bold mb-3">⚡ การกระทำเพิ่มเติม</h2>
        <div className="flex flex-wrap gap-2">
          <a
            href="/import?type=drugs"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📥 นำเข้ารายการยา (Excel)
          </a>
          <a
            href="/inventory"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            📦 ดูคลังยา
          </a>
          <a
            href="/requests"
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            📝 สร้างใบเบิกยา
          </a>
        </div>
      </div>
    </div>
  );
}
