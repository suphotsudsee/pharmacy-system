'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalHospitals: number;
  totalDrugs: number;
  totalInventory: number;
  pendingRequests: number;
  lowStockItems: number;
  expiringItems: number;
}

interface LowStockItem {
  id: number;
  drug: string;
  hospital: string;
  currentStock: number;
  unit: string;
}

interface ExpiringItem {
  id: number;
  drug: string;
  hospital: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

interface RecentRequest {
  id: number;
  requestNumber: string;
  hospital: string;
  status: string;
  requestDate: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [expiring, setExpiring] = useState<ExpiringItem[]>([]);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [hospitalId, setHospitalId] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, [hospitalId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const url = hospitalId 
        ? `/api/dashboard/stats?hospitalId=${hospitalId}`
        : '/api/dashboard/stats';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStats(data.data.stats);
        setLowStock(data.data.alerts.lowStock);
        setExpiring(data.data.alerts.expiring);
        setRecentRequests(data.data.recentRequests);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      PENDING: 'รออนุมัติ',
      APPROVED: 'อนุมัติแล้ว',
      PROCESSING: 'กำลังเตรียม',
      COMPLETED: 'เสร็จสิ้น',
      CANCELLED: 'ยกเลิก',
      REJECTED: 'ปฏิเสธ',
    };
    return (
      <span className={`px-2 py-1 rounded text-sm ${badges[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📊 Dashboard</h1>
        <button
          onClick={fetchStats}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔄 รีเฟรช
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500 mb-1">โรงพยาบาล</div>
          <div className="text-3xl font-bold text-blue-600">{stats?.totalHospitals || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500 mb-1">รายการยา</div>
          <div className="text-3xl font-bold text-purple-600">{stats?.totalDrugs || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500 mb-1">รายการคลัง</div>
          <div className="text-3xl font-bold text-green-600">{stats?.totalInventory || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500 mb-1">รออนุมัติ</div>
          <div className="text-3xl font-bold text-yellow-600">{stats?.pendingRequests || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500 mb-1">ยาใกล้หมด</div>
          <div className="text-3xl font-bold text-orange-600">{stats?.lowStockItems || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500 mb-1">ใกล้หมดอายุ</div>
          <div className="text-3xl font-bold text-red-600">{stats?.expiringItems || 0}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold flex items-center">
              <span className="text-orange-500 mr-2">⚠️</span>
              ยาใกล้หมดสต็อก
            </h2>
          </div>
          <div className="p-4">
            {lowStock.length === 0 ? (
              <p className="text-gray-500 text-center py-4">ไม่มียาที่ใกล้หมดสต็อก</p>
            ) : (
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <div>
                      <div className="font-medium">{item.drug}</div>
                      <div className="text-sm text-gray-500">{item.hospital}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-600">{item.currentStock} {item.unit}</div>
                      <div className="text-xs text-gray-500">คงเหลือ</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expiring Alert */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold flex items-center">
              <span className="text-red-500 mr-2">⏰</span>
              ยาใกล้หมดอายุ (6 เดือน)
            </h2>
          </div>
          <div className="p-4">
            {expiring.length === 0 ? (
              <p className="text-gray-500 text-center py-4">ไม่มียาที่ใกล้หมดอายุ</p>
            ) : (
              <div className="space-y-2">
                {expiring.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <div>
                      <div className="font-medium">{item.drug}</div>
                      <div className="text-sm text-gray-500">{item.hospital}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">{item.daysUntilExpiry} วัน</div>
                      <div className="text-xs text-gray-500">{new Date(item.expiryDate).toLocaleDateString('th-TH')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="mt-6 bg-white rounded-xl shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold flex items-center">
            <span className="mr-2">📝</span>
            ใบเบิกยาล่าสุด
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">เลขที่</th>
                <th className="px-4 py-2 text-left">โรงพยาบาล</th>
                <th className="px-4 py-2 text-left">สถานะ</th>
                <th className="px-4 py-2 text-left">วันที่</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    ยังไม่มีใบเบิกยา
                  </td>
                </tr>
              ) : (
                recentRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <a href={`/requests/${req.id}`} className="text-blue-600 hover:underline">
                        {req.requestNumber}
                      </a>
                    </td>
                    <td className="px-4 py-2">{req.hospital}</td>
                    <td className="px-4 py-2">{getStatusBadge(req.status)}</td>
                    <td className="px-4 py-2">
                      {new Date(req.requestDate).toLocaleDateString('th-TH')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}