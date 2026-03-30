'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

/**
 * 📦 Inventory Page - คลังยา
 * - Modern table with stock status indicators
 * - Advanced filtering with real-time updates
 * - Visual alerts for low stock and expiring items
 * - Dark mode optimized
 */

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

// Stock Status Component
function StockStatusBadge({ stock, minStock, reorderPoint }: { stock: number; minStock: number; reorderPoint: number }) {
  let status = { label: 'ปกติ', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: '✅' };
  
  if (stock === 0) {
    status = { label: 'หมดสต็อก', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: '❌' };
  } else if (stock <= minStock) {
    status = { label: 'ใกล้หมด', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: '⚠️' };
  } else if (stock <= reorderPoint) {
    status = { label: 'ต้องสั่งซื้อ', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '📦' };
  }
  
  return (
    <span className={`badge ${status.color}`}>
      <span className="mr-1">{status.icon}</span>
      {status.label}
    </span>
  );
}

// Expiry Badge Component
function ExpiryBadge({ expiryDate }: { expiryDate: string | null }) {
  if (!expiryDate) {
    return <span className="text-gray-400">-</span>;
  }
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const isExpiringSoon = daysUntilExpiry <= 180;
  const isCritical = daysUntilExpiry <= 30;
  
  if (isCritical) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-red-600 dark:text-red-400 font-medium">
          {expiry.toLocaleDateString('th-TH')}
        </span>
        <span className="text-red-500 animate-pulse">⚠️</span>
      </div>
    );
  }
  
  if (isExpiringSoon) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-orange-600 dark:text-orange-400">
          {expiry.toLocaleDateString('th-TH')}
        </span>
        <span className="text-orange-500">⏰</span>
      </div>
    );
  }
  
  return (
    <span className="text-gray-600 dark:text-gray-300">
      {expiry.toLocaleDateString('th-TH')}
    </span>
  );
}

// Loading Skeleton
function TableSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="skeleton h-4 w-32"></div>
          <div className="skeleton h-4 w-48 flex-1"></div>
          <div className="skeleton h-4 w-20"></div>
          <div className="skeleton h-4 w-24"></div>
          <div className="skeleton h-4 w-20"></div>
        </div>
      ))}
    </div>
  );
}

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
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
    setSearch(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchInventory();
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setHospitalFilter('');
    setStatusFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchInventory();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📦 คลังยา
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            จัดการสต็อกยาในคลัง
          </p>
        </div>
        {isAuthenticated && (
          <Link
            href="/inventory/new"
            className="btn btn-primary hover-lift"
          >
            <span>➕</span>
            <span>เพิ่มสต็อกยา</span>
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ค้นหายา..."
                className="form-input pl-10"
              />
            </div>

            {/* Hospital Filter */}
            <select
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
              className="form-input"
            >
              <option value="">ทุกโรงพยาบาล</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="">ทุกสถานะ</option>
              <option value="OUT_OF_STOCK">❌ หมดสต็อก</option>
              <option value="LOW_STOCK">⚠️ ใกล้หมด</option>
              <option value="REORDER">📦 ต้องสั่งซื้อ</option>
              <option value="NORMAL">✅ ปกติ</option>
            </select>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                🔍 ค้นหา
              </button>
              {(search || hospitalFilter || statusFilter) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-ghost"
                >
                  ✖️
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stats-card stats-card-blue">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">รายการทั้งหมด</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {pagination.total.toLocaleString()}
          </div>
        </div>
        <div className="stats-card stats-card-green">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">ปกติ</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {inventory.filter(i => i.currentStock > i.drug.reorderPoint).length}
          </div>
        </div>
        <div className="stats-card stats-card-orange">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">ต้องสั่งซื้อ</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {inventory.filter(i => i.currentStock > 0 && i.currentStock <= i.drug.reorderPoint && i.currentStock > i.drug.minStock).length}
          </div>
        </div>
        <div className="stats-card stats-card-red">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">หมดสต็อก/ใกล้หมด</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {inventory.filter(i => i.currentStock <= i.drug.minStock).length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <TableSkeleton />
        ) : inventory.length === 0 ? (
          <div className="empty-state py-12">
            <div className="empty-state-icon">📦</div>
            <p className="empty-state-title">ไม่พบรายการสต็อก</p>
            <p className="empty-state-description">
              {search || hospitalFilter || statusFilter
                ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'
                : 'เริ่มเพิ่มสต็อกยาใหม่ได้เลย'}
            </p>
            {isAuthenticated && !search && !hospitalFilter && !statusFilter && (
              <Link href="/inventory/new" className="btn btn-primary mt-4">
                ➕ เพิ่มสต็อกยา
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>โรงพยาบาล</th>
                <th>ยา</th>
                <th>สต็อก</th>
                <th>สถานะ</th>
                <th>หมดอายุ</th>
                {isAuthenticated && <th className="text-right">การจัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {item.hospital.name}
                    </span>
                  </td>
                  <td>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.drug.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {item.drug.drugCode}
                    </div>
                  </td>
                  <td>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {item.currentStock.toLocaleString()} {item.drug.unit}
                    </div>
                    {item.reservedStock > 0 && (
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">
                        🔒 จอง: {item.reservedStock.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <StockStatusBadge
                      stock={item.currentStock}
                      minStock={item.drug.minStock}
                      reorderPoint={item.drug.reorderPoint}
                    />
                  </td>
                  <td>
                    <ExpiryBadge expiryDate={item.expiryDate} />
                  </td>
                  {isAuthenticated && (
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/inventory/${item.id}`}
                          className="btn btn-ghost text-sm !px-2 !py-1"
                          title="ดูรายละเอียด"
                        >
                          👁️
                        </Link>
                        <Link
                          href={`/inventory/${item.id}`}
                          className="btn btn-ghost text-sm !px-2 !py-1"
                          title="แก้ไข"
                        >
                          ✏️
                        </Link>
                      </div>
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
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← ก่อนหน้า
          </button>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">
              หน้า {pagination.page} / {pagination.totalPages}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500 dark:text-gray-400">
              ทั้งหมด {pagination.total.toLocaleString()} รายการ
            </span>
          </div>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="btn btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ถัดไป →
          </button>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-6">
        <Link href="/" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
          ← กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}