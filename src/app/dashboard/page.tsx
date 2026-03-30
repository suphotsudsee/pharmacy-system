'use client';

import { useState, useEffect } from 'react';

/**
 * 📊 Dashboard Page
 * - Modern stats cards with gradients
 * - Animated counters
 * - Responsive grid layout
 * - Dark mode optimized
 */

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

// Stats Card Component
function StatsCard({
  icon,
  label,
  value,
  colorClass,
  trend,
}: {
  icon: string;
  label: string;
  value: number;
  colorClass: string;
  trend?: { value: number; isUp: boolean };
}) {
  return (
    <div className={`stats-card ${colorClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-secondary mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-foreground animate-fade-in">
            {value.toLocaleString()}
          </p>
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                trend.isUp ? "text-green-500" : "text-red-500"
              }`}
            >
              <span>{trend.isUp ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-secondary">จากเดือนก่อน</span>
            </div>
          )}
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; className: string; icon: string }
  > = {
    PENDING: {
      label: "รออนุมัติ",
      className: "status-pending",
      icon: "⏳",
    },
    APPROVED: {
      label: "อนุมัติแล้ว",
      className: "status-approved",
      icon: "✅",
    },
    PROCESSING: {
      label: "กำลังเตรียม",
      className: "status-processing",
      icon: "📦",
    },
    COMPLETED: {
      label: "เสร็จสิ้น",
      className: "status-completed",
      icon: "🎉",
    },
    CANCELLED: {
      label: "ยกเลิก",
      className: "status-cancelled",
      icon: "❌",
    },
    REJECTED: {
      label: "ปฏิเสธ",
      className: "status-rejected",
      icon: "🚫",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    icon: "📋",
  };

  return (
    <span className={`badge ${config.className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}

// Alert Card Component
function AlertCard({
  title,
  icon,
  iconColor,
  items,
  emptyText,
  renderItem,
}: {
  title: string;
  icon: string;
  iconColor: string;
  items: any[];
  emptyText: string;
  renderItem: (item: any) => React.ReactNode;
}) {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className={iconColor}>{icon}</span>
          {title}
        </h2>
      </div>
      <div className="p-4">
        {items.length === 0 ? (
          <div className="empty-state py-8">
            <div className="empty-state-icon">✨</div>
            <p className="empty-state-description">{emptyText}</p>
          </div>
        ) : (
          <div className="space-y-2">{items.slice(0, 5).map(renderItem)}</div>
        )}
      </div>
    </div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl"
            ></div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [expiring, setExpiring] = useState<ExpiringItem[]>([]);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [hospitalId, setHospitalId] = useState<string>("");

  useEffect(() => {
    fetchStats();
  }, [hospitalId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const url = hospitalId
        ? `/api/dashboard/stats?hospitalId=${hospitalId}`
        : "/api/dashboard/stats";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStats(data.data.stats);
        setLowStock(data.data.alerts.lowStock);
        setExpiring(data.data.alerts.expiring);
        setRecentRequests(data.data.recentRequests);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            📊 Dashboard
          </h1>
          <p className="text-secondary mt-1">
            ภาพรวมระบบคลังยา
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="btn btn-primary hover-lift"
        >
          <span>🔄</span>
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard
          icon="🏨"
          label="โรงพยาบาล"
          value={stats?.totalHospitals || 0}
          colorClass="stats-card-blue"
        />
        <StatsCard
          icon="💊"
          label="รายการยา"
          value={stats?.totalDrugs || 0}
          colorClass="stats-card-purple"
        />
        <StatsCard
          icon="📦"
          label="รายการคลัง"
          value={stats?.totalInventory || 0}
          colorClass="stats-card-green"
        />
        <StatsCard
          icon="⏳"
          label="รออนุมัติ"
          value={stats?.pendingRequests || 0}
          colorClass="stats-card-yellow"
        />
        <StatsCard
          icon="⚠️"
          label="ยาใกล้หมด"
          value={stats?.lowStockItems || 0}
          colorClass="stats-card-orange"
        />
        <StatsCard
          icon="⏰"
          label="ใกล้หมดอายุ"
          value={stats?.expiringItems || 0}
          colorClass="stats-card-red"
        />
      </div>

      {/* Alert Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Low Stock Alert */}
        <AlertCard
          title="ยาใกล้หมดสต็อก"
          icon="⚠️"
          iconColor="text-orange-500"
          items={lowStock}
          emptyText="ไม่มียาที่ใกล้หมดสต็อก 🎉"
          renderItem={(item: LowStockItem) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {item.drug}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  {item.hospital}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-orange-600 dark:text-orange-400">
                  {item.currentStock.toLocaleString()} {item.unit}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">คงเหลือ</div>
              </div>
            </div>
          )}
        />

        {/* Expiring Alert */}
        <AlertCard
          title="ยาใกล้หมดอายุ (6 เดือน)"
          icon="⏰"
          iconColor="text-red-500"
          items={expiring}
          emptyText="ไม่มียาที่ใกล้หมดอายุ 🎉"
          renderItem={(item: ExpiringItem) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {item.drug}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  {item.hospital}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-red-600 dark:text-red-400">
                  {item.daysUntilExpiry} วัน
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {new Date(item.expiryDate).toLocaleDateString("th-TH")}
                </div>
              </div>
            </div>
          )}
        />
      </div>

      {/* Recent Requests Table */}
      <div className="table-container">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>📝</span>
            ใบเบิกยาล่าสุด
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>เลขที่</th>
                <th>โรงพยาบาล</th>
                <th>สถานะ</th>
                <th>วันที่</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state py-8">
                      <div className="empty-state-icon">📋</div>
                      <p className="empty-state-title">ยังไม่มีใบเบิกยา</p>
                      <p className="empty-state-description">
                        เริ่มสร้างใบเบิกยาใหม่ได้เลย
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <a
                        href={`/requests/${req.id}`}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium hover:underline transition-colors"
                      >
                        {req.requestNumber}
                      </a>
                    </td>
                    <td className="text-gray-700 dark:text-gray-200">
                      {req.hospital}
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="text-gray-700 dark:text-gray-200">
                      {new Date(req.requestDate).toLocaleDateString("th-TH")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <a
          href="/drugs/new"
          className="card p-4 hover-lift text-center group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
            ➕
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-200">
            เพิ่มยาใหม่
          </div>
        </a>
        <a
          href="/inventory/new"
          className="card p-4 hover-lift text-center group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
            📦
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-200">
            เพิ่มสต็อกยา
          </div>
        </a>
        <a
          href="/requests/new"
          className="card p-4 hover-lift text-center group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
            📝
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-200">
            สร้างใบเบิกยา
          </div>
        </a>
        <a
          href="/import/new"
          className="card p-4 hover-lift text-center group"
        >
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
            📥
          </div>
          <div className="font-medium text-gray-700 dark:text-gray-200">
            นำเข้าข้อมูล
          </div>
        </a>
      </div>
    </div>
  );
}