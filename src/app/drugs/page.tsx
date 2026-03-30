'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

/**
 * 💊 Drugs Page - รายการยา
 * - Modern table design with hover effects
 * - Advanced search and filters
 * - Pagination with smooth transitions
 * - Dark mode optimized
 */

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

// Status Badge Component
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`badge ${
        isActive
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {isActive ? "✅ ใช้งาน" : "❌ ปิดการใช้งาน"}
    </span>
  );
}

// Loading Skeleton
function TableSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="skeleton h-4 w-24"></div>
          <div className="skeleton h-4 w-32 flex-1"></div>
          <div className="skeleton h-4 w-20"></div>
          <div className="skeleton h-4 w-16"></div>
        </div>
      ))}
    </div>
  );
}

export default function DrugsPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
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
    setSearch(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDrugs();
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setCategoryFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDrugs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            💊 รายการยา
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            จัดการข้อมูลยาในระบบ
          </p>
        </div>
        {isAuthenticated && (
          <Link
            href="/drugs/new"
            className="btn btn-primary hover-lift"
          >
            <span>➕</span>
            <span>เพิ่มยา</span>
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
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

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-input w-full md:w-48"
            >
              <option value="">ทุกหมวด</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
              >
                🔍 ค้นหา
              </button>
              {(search || categoryFilter) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-ghost"
                >
                  ✖️ ล้าง
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stats-card stats-card-blue">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">จำนวนรายการยา</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {pagination.total.toLocaleString()}
          </div>
        </div>
        <div className="stats-card stats-card-green">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">ใช้งานอยู่</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {drugs.filter(d => d.isActive).length}
          </div>
        </div>
        <div className="stats-card stats-card-purple">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">หมวดหมู่</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {categories.length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <TableSkeleton />
        ) : drugs.length === 0 ? (
          <div className="empty-state py-12">
            <div className="empty-state-icon">💊</div>
            <p className="empty-state-title">ไม่พบรายการยา</p>
            <p className="empty-state-description">
              {search || categoryFilter
                ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'
                : 'เริ่มเพิ่มยาใหม่ได้เลย'}
            </p>
            {isAuthenticated && !search && !categoryFilter && (
              <Link href="/drugs/new" className="btn btn-primary mt-4">
                ➕ เพิ่มยาใหม่
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ชื่อยา</th>
                <th>หมวด</th>
                <th>รูปแบบ</th>
                <th>หน่วย</th>
                <th>จุดสั่งซื้อ</th>
                <th>สถานะ</th>
                {isAuthenticated && <th className="text-right">การจัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {drugs.map((drug) => (
                <tr key={drug.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="font-mono text-sm text-gray-600 dark:text-gray-300">
                    {drug.drugCode}
                  </td>
                  <td>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {drug.name}
                    </div>
                    {drug.genericName && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {drug.genericName}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="text-gray-600 dark:text-gray-300">
                      {drug.category?.name || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="text-gray-600 dark:text-gray-300">
                      {drug.dosageForm || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {drug.unit}
                    </span>
                  </td>
                  <td className="text-gray-600 dark:text-gray-300">
                    {drug.reorderPoint.toLocaleString()}
                  </td>
                  <td>
                    <StatusBadge isActive={drug.isActive} />
                  </td>
                  {isAuthenticated && (
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/drugs/${drug.id}`}
                          className="btn btn-ghost text-sm !px-2 !py-1"
                          title="ดูรายละเอียด"
                        >
                          👁️
                        </Link>
                        <Link
                          href={`/drugs/${drug.id}`}
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