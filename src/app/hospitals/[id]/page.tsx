'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface Province {
  id: number;
  code: string;
  name: string;
}

interface FacilityType {
  id: number;
  code: string;
  name: string;
}

export default function HospitalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const hospitalId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    hospCode: '',
    name: '',
    shortName: '',
    provinceId: '',
    facilityTypeId: '',
    googleSheetLink: '',
    address: '',
    phone: '',
    fax: '',
    email: '',
    isActive: true
  });

  const [hospital, setHospital] = useState<any>(null);

  useEffect(() => {
    fetchHospital();
    fetchProvinces();
    fetchFacilityTypes();
  }, [hospitalId]);

  const fetchHospital = async () => {
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}`);
      const data = await res.json();
      if (data.success) {
        setHospital(data.data);
        setFormData({
          hospCode: data.data.hospCode,
          name: data.data.name,
          shortName: data.data.shortName || '',
          provinceId: data.data.provinceId?.toString() || '',
          facilityTypeId: data.data.facilityTypeId?.toString() || '',
          googleSheetLink: data.data.googleSheetLink || '',
          address: data.data.address || '',
          phone: data.data.phone || '',
          fax: data.data.fax || '',
          email: data.data.email || '',
          isActive: data.data.isActive
        });
      }
    } catch (e) {
      console.error('Error fetching hospital:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await fetch('/api/provinces');
      const data = await res.json();
      if (data.success) setProvinces(data.data);
    } catch (e) {
      console.error('Error fetching provinces:', e);
    }
  };

  const fetchFacilityTypes = async () => {
    try {
      const res = await fetch('/api/facility-types');
      const data = await res.json();
      if (data.success) setFacilityTypes(data.data);
    } catch (e) {
      console.error('Error fetching facility types:', e);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/hospitals/${hospitalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          provinceId: formData.provinceId ? parseInt(formData.provinceId) : null,
          facilityTypeId: formData.facilityTypeId ? parseInt(formData.facilityTypeId) : null
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert('อัปเดตข้อมูลเรียบร้อยแล้ว');
        setIsEditing(false);
        fetchHospital();
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error updating hospital:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('คุณต้องการลบโรงพยาบาลนี้หรือไม่?')) return;

    try {
      const res = await fetch(`/api/hospitals/${hospitalId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (data.success) {
        alert('ลบโรงพยาบาลเรียบร้อยแล้ว');
        router.push('/hospitals');
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error deleting hospital:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
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

  if (!hospital) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">ไม่พบโรงพยาบาล</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a href="/hospitals" className="text-blue-600 hover:underline">
          ← กลับไปหน้าโรงพยาบาล
        </a>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🏥 {hospital.name}</h1>
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
            {/* Edit Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">รหัสโรงพยาบาล</label>
                <input
                  type="text"
                  value={formData.hospCode}
                  onChange={(e) => setFormData({ ...formData, hospCode: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อโรงพยาบาล</label>
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
                <label className="block text-sm font-medium mb-1">ชื่อย่อ</label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">จังหวัด</label>
                <select
                  value={formData.provinceId}
                  onChange={(e) => setFormData({ ...formData, provinceId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- เลือกจังหวัด --</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ประเภทสถานบริการ</label>
                <select
                  value={formData.facilityTypeId}
                  onChange={(e) => setFormData({ ...formData, facilityTypeId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- เลือกประเภท --</option>
                  {facilityTypes.map((ft) => (
                    <option key={ft.id} value={ft.id}>{ft.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">โทรศัพท์</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">อีเมล</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
            {/* View Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">รหัสโรงพยาบาล</div>
                <div className="font-mono text-lg">{hospital.hospCode}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">ชื่อย่อ</div>
                <div className="text-lg">{hospital.shortName || '-'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">จังหวัด</div>
                <div className="text-lg">{hospital.province?.name || '-'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">ประเภท</div>
                <div className="text-lg">{hospital.facilityType?.name || '-'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">โทรศัพท์</div>
                <div className="text-lg">{hospital.phone || '-'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">อีเมล</div>
                <div className="text-lg">{hospital.email || '-'}</div>
              </div>
            </div>

            {hospital.address && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">ที่อยู่</div>
                <div className="text-lg">{hospital.address}</div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">สถานะ</div>
              <div className="text-lg">
                {hospital.isActive ? (
                  <span className="text-green-600">✅ ใช้งาน</span>
                ) : (
                  <span className="text-red-600">❌ ไม่ใช้งาน</span>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-2">จำนวนรายการยาในคลัง</div>
              <div className="text-3xl font-bold text-blue-700">
                {hospital._count?.drugInventories || 0} รายการ
              </div>
              <div className="mt-2">
                <a
                  href={`/inventory?hospitalId=${hospital.id}`}
                  className="text-blue-600 hover:underline"
                >
                  ดูคลังยา →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}