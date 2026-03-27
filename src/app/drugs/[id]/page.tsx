'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface DrugCategory {
  id: number;
  code: string;
  name: string;
}

interface Drug {
  id: number;
  drugCode: string;
  name: string;
  genericName: string | null;
  categoryId: number | null;
  category: { id: number; name: string } | null;
  dosageForm: string | null;
  strength: string | null;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitPrice: number | null;
  isActive: boolean;
  _count?: { inventories: number; requests: number };
}

export default function DrugDetailPage() {
  const router = useRouter();
  const params = useParams();
  const drugId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<DrugCategory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [drug, setDrug] = useState<Drug | null>(null);
  
  const [formData, setFormData] = useState({
    drugCode: '',
    name: '',
    genericName: '',
    categoryId: '',
    dosageForm: 'เม็ด',
    strength: '',
    unit: 'เม็ด',
    minStock: 0,
    maxStock: 1000,
    reorderPoint: 50,
    unitPrice: '',
    isActive: true
  });

  useEffect(() => {
    fetchDrug();
    fetchCategories();
  }, [drugId]);

  const fetchDrug = async () => {
    try {
      const res = await fetch(`/api/drugs/${drugId}`);
      const data = await res.json();
      if (data.success) {
        setDrug(data.data);
        setFormData({
          drugCode: data.data.drugCode,
          name: data.data.name,
          genericName: data.data.genericName || '',
          categoryId: data.data.categoryId?.toString() || '',
          dosageForm: data.data.dosageForm || 'เม็ด',
          strength: data.data.strength || '',
          unit: data.data.unit,
          minStock: data.data.minStock,
          maxStock: data.data.maxStock,
          reorderPoint: data.data.reorderPoint,
          unitPrice: data.data.unitPrice?.toString() || '',
          isActive: data.data.isActive
        });
      }
    } catch (e) {
      console.error('Error fetching drug:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/drug-categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/drugs/${drugId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert('อัปเดตข้อมูลเรียบร้อยแล้ว');
        setIsEditing(false);
        fetchDrug();
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error updating drug:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('คุณต้องการลบรายการยานี้หรือไม่?')) return;

    try {
      const res = await fetch(`/api/drugs/${drugId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message || 'ลบรายการยาเรียบร้อยแล้ว');
        router.push('/drugs');
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error deleting drug:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const dosageForms = ['เม็ด', 'แคปซูล', 'น้ำยา', 'ฉีด', 'ทา', 'หยอด', 'สเปรย์', 'ผง', 'ซัด', 'อื่นๆ'];
  const units = ['เม็ด', 'แคปซูล', 'ขวด', 'หลอด', 'ซอง', 'กล่อง', 'แผง', 'ม้วน', 'ชิ้น', 'กรัม', 'มิลลิลิตร', 'อื่นๆ'];

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

  if (!drug) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">ไม่พบรายการยา</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a href="/drugs" className="text-blue-600 hover:underline">
          ← กลับไปหน้ารายการยา
        </a>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">💊 {drug.name}</h1>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  ✏️ แก้ไข
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  🗑️ ลบ
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">รหัสยา</label>
                <input
                  type="text"
                  value={formData.drugCode}
                  onChange={(e) => setFormData({ ...formData, drugCode: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อยา</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อสามัญ</label>
                <input
                  type="text"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">รูปแบบยา</label>
                <select
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dosageForms.map((form) => (
                    <option key={form} value={form}>{form}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ความแรง</label>
                <input
                  type="text"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">หน่วย</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">สต็อกขั้นต่ำ</label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">สต็อกสูงสุด</label>
                <input
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">จุดสั่งซื้อ</label>
                <input
                  type="number"
                  value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ราคา/หน่วย</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">สถานะ</label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">ใช้งาน</option>
                <option value="false">ไม่ใช้งาน</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">รหัสยา</div>
                <div className="font-mono text-lg">{drug.drugCode}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">ชื่อสามัญ</div>
                <div className="text-lg">{drug.genericName || '-'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">หมวดหมู่</div>
                <div className="text-lg">{drug.category?.name || '-'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">รูปแบบยา</div>
                <div className="text-lg">{drug.dosageForm || '-'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">ความแรง</div>
                <div className="text-lg">{drug.strength || '-'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">หน่วย</div>
                <div className="text-lg">{drug.unit}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">สต็อกขั้นต่ำ</div>
                <div className="text-lg">{drug.minStock}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">สต็อกสูงสุด</div>
                <div className="text-lg">{drug.maxStock}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">จุดสั่งซื้อ</div>
                <div className="text-lg">{drug.reorderPoint}</div>
              </div>
            </div>

            {drug.unitPrice && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600">ราคาต่อหน่วย</div>
                <div className="text-2xl font-bold text-blue-700">฿{drug.unitPrice.toFixed(2)}</div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">สถานะ</div>
              <div className="text-lg">
                {drug.isActive ? (
                  <span className="text-green-600">✅ ใช้งาน</span>
                ) : (
                  <span className="text-red-600">❌ ไม่ใช้งาน</span>
                )}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-2">สถิติการใช้งาน</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-purple-700">{drug._count?.inventories || 0}</div>
                  <div className="text-sm text-purple-600">รายการในคลัง</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700">{drug._count?.requests || 0}</div>
                  <div className="text-sm text-purple-600">ครั้งในใบเบิก</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}