'use client';

import { useState, useEffect } from 'react';

interface DrugRequest {
  id: number;
  requestNumber: string;
  hospital: { id: number; name: string };
  requestDate: string;
  requiredDate: string | null;
  status: string;
  requestedBy: string | null;
  notes: string | null;
  items: Array<{
    id: number;
    drug: { id: number; drugCode: string; name: string; unit: string };
    quantity: number;
    approvedQuantity: number | null;
    notes: string | null;
  }>;
}

interface Hospital {
  id: number;
  name: string;
  hospCode: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'PENDING': { label: 'รออนุมัติ', color: 'bg-yellow-100 text-yellow-800' },
  'APPROVED': { label: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800' },
  'PROCESSING': { label: 'กำลังเตรียม', color: 'bg-blue-100 text-blue-800' },
  'COMPLETED': { label: 'เสร็จสิ้น', color: 'bg-gray-100 text-gray-800' },
  'CANCELLED': { label: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
  'REJECTED': { label: 'ปฏิเสธ', color: 'bg-red-100 text-red-800' }
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<DrugRequest[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, selectedHospital, selectedStatus]);

  const fetchHospitals = async () => {
    try {
      const res = await fetch('/api/hospitals?limit=1000');
      const data = await res.json();
      if (data.success) setHospitals(data.data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (selectedHospital) params.set('hospitalId', selectedHospital);
      if (selectedStatus) params.set('status', selectedStatus);

      const res = await fetch(`/api/requests?${params}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['PENDING'];
    return (
      <span className={`px-2 py-1 rounded text-sm ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📝 ใบเบิกยา</h1>
        <a
          href="/requests/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + สร้างใบเบิกยา
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">โรงพยาบาล</label>
            <select
              value={selectedHospital}
              onChange={(e) => {
                setSelectedHospital(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกโรงพยาบาล</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">สถานะ</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกสถานะ</option>
              {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedHospital('');
                setSelectedStatus('');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              รีเซ็ตตัวกรอง
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-yellow-50 rounded-lg p-4 mb-6">
        <div className="text-sm text-yellow-800">
          จำนวนใบเบิกยา: <span className="font-bold">{pagination.total}</span> รายการ
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">เลขที่</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">โรงพยาบาล</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">วันที่เบิก</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">รายการ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">สถานะ</th>
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
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    ไม่พบใบเบิกยา
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a
                        href={`/requests/${req.id}`}
                        className="text-blue-600 hover:underline font-mono"
                      >
                        {req.requestNumber}
                      </a>
                    </td>
                    <td className="px-4 py-3">{req.hospital.name}</td>
                    <td className="px-4 py-3">
                      {new Date(req.requestDate).toLocaleDateString('th-TH')}
                      {req.requiredDate && (
                        <div className="text-xs text-gray-500">
                          ต้องการ: {new Date(req.requiredDate).toLocaleDateString('th-TH')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{req.items.length}</span>
                      <span className="text-gray-500 ml-1">รายการ</span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <a
                          href={`/requests/${req.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          ดู
                        </a>
                        {req.status === 'PENDING' && (
                          <>
                            <a
                              href={`/requests/${req.id}`}
                              className="text-yellow-600 hover:underline text-sm"
                            >
                              แก้ไข
                            </a>
                            <button
                              onClick={async () => {
                                if (!confirm('ยืนยันลบใบเบิกยานี้?')) return;
                                const res = await fetch(`/api/requests/${req.id}`, { method: 'DELETE' });
                                const data = await res.json();
                                if (data.success) {
                                  fetchRequests();
                                } else {
                                  alert(data.error || 'เกิดข้อผิดพลาด');
                                }
                              }}
                              className="text-red-600 hover:underline text-sm"
                            >
                              ลบ
                            </button>
                          </>
                        )}
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

      {/* Status Legend */}
      <div className="mt-6 bg-white rounded-xl shadow p-4">
        <h3 className="font-bold mb-2">📖 คำอธิบายสถานะ</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {Object.entries(STATUS_CONFIG).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded ${value.color}`}>{value.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}