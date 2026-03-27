'use client';

import { useState, useEffect } from 'react';

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
        <a
          href="/hospitals/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + เพิ่มโรงพยาบาล
        </a>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาโรงพยาบาล..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            ค้นหา
          </button>
        </div>
      </form>

      {/* Stats */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="text-sm text-blue-800">
          จำนวนโรงพยาบาลทั้งหมด: <span className="font-bold">{pagination.total}</span> แห่ง
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">รหัส</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ชื่อโรงพยาบาล</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">จังหวัด</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ประเภท</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">รายการยา</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : hospitals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    ไม่พบโรงพยาบาล
                  </td>
                </tr>
              ) : (
                hospitals.map((hospital) => (
                  <tr key={hospital.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {hospital.hospCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{hospital.name}</div>
                      {hospital.shortName && (
                        <div className="text-sm text-gray-500">{hospital.shortName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {hospital.province?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {hospital.facilityType?.name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-blue-600">
                        {hospital._count.drugInventories}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/hospitals/${hospital.id}`}
                        className="text-blue-600 hover:underline mr-2"
                      >
                        ดู
                      </a>
                      <a
                        href={`/inventory?hospitalId=${hospital.id}`}
                        className="text-green-600 hover:underline"
                      >
                        คลังยา
                      </a>
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
    </div>
  );
}