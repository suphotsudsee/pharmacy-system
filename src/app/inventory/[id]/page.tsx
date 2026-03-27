'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Inventory {
  id: number;
  hospitalId: number;
  drugId: number;
  lotNumber: string | null;
  expiryDate: string | null;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  location: string | null;
  status: string;
  daysUntilExpiry: number | null;
  hospital: { id: number; name: string; hospCode: string };
  drug: { 
    id: number; 
    drugCode: string; 
    name: string; 
    unit: string;
    minStock: number;
    reorderPoint: number;
    maxStock: number;
    category: { name: string } | null;
  };
}

interface Transaction {
  id: number;
  transactionType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  lotNumber: string | null;
  notes: string | null;
  performedBy: string | null;
  createdAt: string;
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
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap max-w-xs">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

// Info Icon with tooltip
function InfoIcon({ tooltip }: { tooltip: string }) {
  return (
    <Tooltip content={tooltip}>
      <span className="inline-flex items-center justify-center w-4 h-4 text-xs text-gray-400 bg-gray-200 rounded-full cursor-help ml-1">?</span>
    </Tooltip>
  );
}

export default function InventoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const inventoryId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [formData, setFormData] = useState({
    currentStock: 0,
    lotNumber: '',
    expiryDate: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchTransactions();
  }, [inventoryId]);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`/api/inventory/${inventoryId}`);
      const data = await res.json();
      if (data.success) {
        setInventory(data.data);
        setFormData({
          currentStock: data.data.currentStock,
          lotNumber: data.data.lotNumber || '',
          expiryDate: data.data.expiryDate ? data.data.expiryDate.split('T')[0] : '',
          location: data.data.location || '',
          notes: ''
        });
      }
    } catch (e) {
      console.error('Error fetching inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/inventory/${inventoryId}/transactions`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data || []);
      }
    } catch (e) {
      console.error('Error fetching transactions:', e);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/inventory/${inventoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStock: parseInt(formData.currentStock.toString()) || 0,
          lotNumber: formData.lotNumber || null,
          expiryDate: formData.expiryDate || null,
          location: formData.location || null,
          notes: formData.notes || null
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert('อัปเดตข้อมูลเรียบร้อยแล้ว');
        setIsEditing(false);
        fetchInventory();
        fetchTransactions();
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('คุณต้องการลบรายการคลังยานี้หรือไม่?')) return;

    try {
      const res = await fetch(`/api/inventory/${inventoryId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        alert('ลบรายการคลังยาเรียบร้อยแล้ว');
        router.push('/inventory');
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
        <span className={`px-3 py-1 rounded-full text-sm ${badge.bg} ${badge.text} cursor-help`}>
          {badge.label}
        </span>
      </Tooltip>
    );
  };

  const getTransactionType = (type: string) => {
    const types: Record<string, { icon: string; label: string; color: string }> = {
      RECEIPT: { icon: '📦', label: 'รับเข้า', color: 'text-green-600' },
      DISPENSE: { icon: '📤', label: 'เบิกออก', color: 'text-red-600' },
      ADJUSTMENT: { icon: '🔄', label: 'ปรับปรุง', color: 'text-blue-600' },
      RETURN: { icon: '↩️', label: 'คืน', color: 'text-purple-600' },
      EXPIRED: { icon: '⚠️', label: 'หมดอายุ', color: 'text-orange-600' },
      DAMAGED: { icon: '💥', label: 'เสียหาย', color: 'text-red-600' }
    };
    const t = types[type] || { icon: '❓', label: type, color: 'text-gray-600' };
    return (
      <span className={t.color}>
        {t.icon} {t.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">ไม่พบรายการคลังยา</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a href="/inventory" className="text-blue-600 hover:underline">
          ← กลับไปหน้าคลังยา
        </a>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">📦 {inventory.drug.name}</h1>
            <p className="text-gray-500 mt-1">{inventory.drug.drugCode}</p>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(inventory.status)}
          </div>
        </div>

        {/* ข้อมูลโรงพยาบาลและยา */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">โรงพยาบาล</div>
            <div className="font-medium">{inventory.hospital.name}</div>
            <div className="text-sm text-gray-500">{inventory.hospital.hospCode}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 mb-1">หมวดหมู่</div>
            <div className="font-medium">{inventory.drug.category?.name || '-'}</div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">จำนวนสต็อก</label>
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">หมายเลขล็อต</label>
                <input
                  type="text"
                  value={formData.lotNumber}
                  onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">วันหมดอายุ</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ที่เก็บ</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">หมายเหตุการเปลี่ยนแปลง</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="เหตุผลในการปรับปรุงสต็อก"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* ข้อมูลสต็อก */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Tooltip content="จำนวนสต็อกทั้งหมดที่มีในคลัง">
                <div className="bg-gray-50 rounded-lg p-4 text-center cursor-help">
                  <div className="text-sm text-gray-500 mb-1">จำนวนสต็อก</div>
                  <div className="text-3xl font-bold text-blue-600">{inventory.currentStock}</div>
                  <div className="text-sm text-gray-500">{inventory.drug.unit}</div>
                </div>
              </Tooltip>
              <Tooltip content="จำนวนที่ถูกจองไว้ (ถูกเบิกแล้วแต่ยังไม่ได้รับของ)">
                <div className="bg-gray-50 rounded-lg p-4 text-center cursor-help">
                  <div className="text-sm text-gray-500 mb-1">จองไว้</div>
                  <div className="text-3xl font-bold text-orange-600">{inventory.reservedStock}</div>
                  <div className="text-sm text-gray-500">{inventory.drug.unit}</div>
                </div>
              </Tooltip>
              <Tooltip content="จำนวนที่ใช้ได้จริง = สต็อก - จอง">
                <div className="bg-gray-50 rounded-lg p-4 text-center cursor-help">
                  <div className="text-sm text-gray-500 mb-1">ใช้ได้</div>
                  <div className="text-3xl font-bold text-green-600">{inventory.availableStock}</div>
                  <div className="text-sm text-gray-500">{inventory.drug.unit}</div>
                </div>
              </Tooltip>
              <Tooltip content={`จุดที่ควรสั่งซื้อใหม่ (หากสต็อกต่ำกว่านี้ จะแจ้งเตือน)`}>
                <div className="bg-gray-50 rounded-lg p-4 text-center cursor-help">
                  <div className="text-sm text-gray-500 mb-1">จุดสั่งซื้อ</div>
                  <div className="text-3xl font-bold text-purple-600">{inventory.drug.reorderPoint}</div>
                  <div className="text-sm text-gray-500">{inventory.drug.unit}</div>
                </div>
              </Tooltip>
            </div>

            {/* ข้อมูลเพิ่มเติม */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">หมายเลขล็อต</div>
                <div className="font-medium">{inventory.lotNumber || '-'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">วันหมดอายุ</div>
                <div className="font-medium">
                  {inventory.expiryDate 
                    ? new Date(inventory.expiryDate).toLocaleDateString('th-TH')
                    : '-'}
                </div>
                {inventory.daysUntilExpiry !== null && (
                  <Tooltip content={inventory.daysUntilExpiry < 0 ? 'หมดอายุแล้ว!' : `เหลือ ${inventory.daysUntilExpiry} วัน จนถึงวันหมดอายุ`}>
                    <div className={`text-sm cursor-help ${
                      inventory.daysUntilExpiry < 0 ? 'text-red-600 font-bold' :
                      inventory.daysUntilExpiry < 90 ? 'text-red-600' :
                      inventory.daysUntilExpiry < 180 ? 'text-orange-600' :
                      'text-gray-500'
                    }`}>
                      {inventory.daysUntilExpiry < 0 ? '⚠️ หมดอายุแล้ว!' :
                       inventory.daysUntilExpiry < 30 ? '⚠️ เร่งด่วน!' :
                       `${inventory.daysUntilExpiry} วัน`}
                    </div>
                  </Tooltip>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">ที่เก็บ</div>
                <div className="font-medium">{inventory.location || '-'}</div>
              </div>
            </div>

            {/* Drug info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-500 mb-2">📋 ข้อมูลยา</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">หน่วย:</span>
                  <span className="ml-1 font-medium">{inventory.drug.unit}</span>
                </div>
                <Tooltip content={`สต็อกขั้นต่ำ: ถ้าต่ำกว่านี้ จะแจ้งเตือน LOW_STOCK`}>
                  <div className="cursor-help">
                    <span className="text-gray-500">ขั้นต่ำ:</span>
                    <span className="ml-1 font-medium">{inventory.drug.minStock}</span>
                  </div>
                </Tooltip>
                <Tooltip content={`จุดสั่งซื้อ: ถ้าต่ำกว่านี้ จะแจ้งเตือน REORDER`}>
                  <div className="cursor-help">
                    <span className="text-gray-500">สั่งซื้อที่:</span>
                    <span className="ml-1 font-medium">{inventory.drug.reorderPoint}</span>
                  </div>
                </Tooltip>
                <Tooltip content={`สต็อกสูงสุดที่ควรมี`}>
                  <div className="cursor-help">
                    <span className="text-gray-500">สูงสุด:</span>
                    <span className="ml-1 font-medium">{inventory.drug.maxStock}</span>
                  </div>
                </Tooltip>
              </div>
            </div>

            {/* ปุ่ม */}
            <div className="flex gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                ✏️ แก้ไขสต็อก
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
              >
                🗑️ ลบรายการ
              </button>
            </div>
          </>
        )}
      </div>

      {/* ประวัติการเคลื่อนไหว */}
      <div className="mt-6 bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4">📊 ประวัติการเคลื่อนไหว</h2>
        {transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-4">ยังไม่มีประวัติการเคลื่อนไหว</div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{getTransactionType(tx.transactionType)}</div>
                  <div className="text-sm text-gray-500">
                    {tx.previousStock} → {tx.newStock} ({tx.quantity >= 0 ? '+' : ''}{tx.quantity})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{new Date(tx.createdAt).toLocaleDateString('th-TH')}</div>
                  {tx.notes && <div className="text-xs text-gray-500">{tx.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}