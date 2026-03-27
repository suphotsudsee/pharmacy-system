'use client';

import { useState, useEffect } from 'react';

interface InventoryItem {
  id: number;
  hospital: { id: number; name: string; hospCode: string };
  drug: { id: number; drugCode: string; name: string; unit: string; category: { name: string } | null; minStock: number; reorderPoint: number; maxStock: number };
  lotNumber: string | null;
  expiryDate: string | null;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  location: string | null;
  lastRestocked: string | null;
  status: string;
  daysUntilExpiry: number | null;
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

// Tooltip component
function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [searchDrug, setSearchDrug] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [pagination.page, selectedHospital, showLowStock, showExpiring]);

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
      if (selectedHospital) params.set('hospitalId', selectedHospital);
      if (showLowStock) params.set('lowStock', 'true');
      if (showExpiring) params.set('expiringSoon', 'true');
      if (searchDrug) params.set('search', searchDrug);

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

  const handleDelete = async (id: number, drugName: string) => {
    if (!confirm(`คุณต้องการลบรายการคลังยา "${drugName}" หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message || 'ลบรายการคลังยาเรียบร้อยแล้ว');
        fetchInventory();
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error deleting inventory:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string; tooltip: string }> = {
      NORMAL: { bg: 'bg-green-100', text: 'text-green-800', label: 'ปกติ', tooltip: 'สต็อกเพียงพอ อยู่ในเกณฑ์ปกติ' },
      LOW_STOCK: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'ใกล้หมด', tooltip: 'สต็อกต่ำกว่าขั้นต่ำ ควรเติมโดยเร็ว' },
      OUT_OF_STOCK: { bg: 'bg-red-100', text: 'text-red-800', label: 'หมด', tooltip: 'สต็อกหมดแล้ว ต้องเติมทันที' },
      REORDER: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'สั่งซื้อ', tooltip: 'สต็อกต่ำกว่าจุดสั่งซื้อ ควรสั่งซื้อใหม่' }
    };
    const badge = badges[status] || badges.NORMAL;
    return (
      <Tooltip content={badge.tooltip}>
        <span className={`px-2 py-1 rounded text-sm ${badge.bg} ${badge.text} cursor-help`}>
          {badge.label}
        </span>
      </Tooltip>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📦 คลังยา</h1>
        <a
          href="/inventory/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + เพิ่มรายการคลังยา
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">โรงพยาบาล</label>
            <select
              value={selectedHospital}
              onChange={(e) => {
                setSelectedHospital(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">ทุกโรงพยาบาล</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ค้นหายา</label>
            <input
              type="text"
              value={searchDrug}
              onChange={(e) => setSearchDrug(e.target.value)}
              placeholder="รหัส/ชื่อยา..."
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => {
                  setShowLowStock(e.target.checked);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">ยาใกล้หมด</span>
            </label>
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showExpiring}
                onChange={(e) => {
                  setShowExpiring(e.target.checked);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">ใกล้หมดอายุ</span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              ค้นหา
            </button>
          </div>
        </form>
      </div>

      {/* Stats */}
      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <div className="text-sm text-purple-800">
          จำนวนรายการคลังยา: <span className="font-bold">{pagination.total}</span> รายการ
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">โรงพยาบาล</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ยา</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Lot No.</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">สต็อก</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">หมดอายุ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">สถานะ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลคลังยา
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.hospital.name}</div>
                      <div className="text-sm text-gray-500">{item.hospital.hospCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.drug.name}</div>
                      <div className="text-sm text-gray-500">{item.drug.drugCode}</div>
                    </td>
                    <td className="px-4 py-3">{item.lotNumber || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Tooltip content="จำนวนสต็อกทั้งหมดที่มีในคลัง">
                          <div className="flex items-center gap-1 cursor-help">
                            <span className="text-xs text-gray-500">สต็อก:</span>
                            <span className={`font-bold ${
                              item.status === 'OUT_OF_STOCK' ? 'text-red-600' :
                              item.status === 'LOW_STOCK' ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {item.currentStock}
                            </span>
                            <span className="text-gray-500 text-xs">{item.drug.unit}</span>
                          </div>
                        </Tooltip>
                        <Tooltip content="จำนวนที่ถูกจองไว้ (เบิกแล้วแต่ยังไม่รับ)">
                          <div className="flex items-center gap-1 text-xs text-gray-500 cursor-help">
                            <span>จอง:</span>
                            <span className="font-medium">{item.reservedStock}</span>
                          </div>
                        </Tooltip>
                        <Tooltip content="จำนวนที่ใช้ได้จริง = สต็อก - จอง">
                          <div className="flex items-center gap-1 text-xs text-blue-600 cursor-help">
                            <span>ใช้ได้:</span>
                            <span className="font-bold">{item.availableStock}</span>
                          </div>
                        </Tooltip>
                        <Tooltip content={`จุดสั่งซื้อใหม่ (ต่ำกว่า ${item.drug.reorderPoint} = ต้องสั่งซื้อ)`}>
                          <div className="flex items-center gap-1 text-xs text-purple-600 cursor-help">
                            <span>สั่งซื้อที่:</span>
                            <span className="font-medium">{item.drug.reorderPoint}</span>
                          </div>
                        </Tooltip>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.expiryDate ? (
                        <div>
                          <div>{new Date(item.expiryDate).toLocaleDateString('th-TH')}</div>
                          {item.daysUntilExpiry !== null && (
                            <Tooltip content={item.daysUntilExpiry < 0 ? 'หมดอายุแล้ว!' : `เหลือ ${item.daysUntilExpiry} วัน จนถึงวันหมดอายุ`}>
                              <div className={`text-xs cursor-help ${
                                item.daysUntilExpiry < 0 ? 'text-red-500 font-bold' :
                                item.daysUntilExpiry < 90 ? 'text-red-500' :
                                item.daysUntilExpiry < 180 ? 'text-orange-500' :
                                'text-gray-500'
                              }`}>
                                {item.daysUntilExpiry < 0 ? 'หมดอายุแล้ว!' :
                                 item.daysUntilExpiry < 30 ? '⚠️ เร่งด่วน!' :
                                 `${item.daysUntilExpiry} วัน`}
                              </div>
                            </Tooltip>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <a
                          href={`/inventory/${item.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          ดู
                        </a>
                        <a
                          href={`/inventory/${item.id}`}
                          className="text-yellow-600 hover:underline text-sm"
                        >
                          แก้ไข
                        </a>
                        <button
                          onClick={() => handleDelete(item.id, item.drug.name)}
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

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4">
        <h3 className="font-bold text-blue-800 mb-2">📖 คำอธิบายสัญลักษณ์</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <div className="font-medium mb-1">📊 สต็อก:</div>
            <ul className="list-disc list-inside ml-2">
              <li><span className="text-green-600">เขียว</span> = ปกติ (สต็อกเพียงพอ)</li>
              <li><span className="text-orange-600">ส้ม</span> = ใกล้หมด (ต่ำกว่าขั้นต่ำ)</li>
              <li><span className="text-red-600">แดง</span> = หมดแล้ว (สต็อก = 0)</li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-1">📋 ค่าต่างๆ:</div>
            <ul className="list-disc list-inside ml-2">
              <li><strong>สต็อก</strong> = จำนวนทั้งหมดที่มี</li>
              <li><strong>จอง</strong> = จำนวนที่ถูกจองไว้</li>
              <li><strong>ใช้ได้</strong> = สต็อก - จอง</li>
              <li><strong>สั่งซื้อที่</strong> = จุดสั่งซื้อใหม่</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}