'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

interface Hospital {
  id: number;
  hospCode: string;
  name: string;
  shortName: string | null;
  provinceId: number | null;
  province: { name: string } | null;
  facilityTypeId: number | null;
  facilityType: { name: string } | null;
  googleSheetLink: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export default function HospitalFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  
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
    email: ''
  });

  useEffect(() => {
    fetchProvinces();
    fetchFacilityTypes();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          provinceId: formData.provinceId ? parseInt(formData.provinceId) : null,
          facilityTypeId: formData.facilityTypeId ? parseInt(formData.facilityTypeId) : null
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert('เพิ่มโรงพยาบาลเรียบร้อยแล้ว');
        router.push('/hospitals');
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error creating hospital:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a href="/hospitals" className="text-blue-600 hover:underline">
          ← กลับไปหน้าโรงพยาบาล
        </a>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">🏥 เพิ่มโรงพยาบาลใหม่</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ข้อมูลพื้นฐาน */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                รหัสโรงพยาบาล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.hospCode}
                onChange={(e) => setFormData({ ...formData, hospCode: e.target.value })}
                required
                placeholder="เช่น EA0010669"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                ชื่อโรงพยาบาล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="ชื่อเต็มโรงพยาบาล"
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
                placeholder="ชื่อย่อ (ถ้ามี)"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Google Sheets Link</label>
              <input
                type="url"
                value={formData.googleSheetLink}
                onChange={(e) => setFormData({ ...formData, googleSheetLink: e.target.value })}
                placeholder="https://docs.google.com/..."
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ที่อยู่และประเภท */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* ข้อมูลติดต่อ */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-medium mb-4">📞 ข้อมูลติดต่อ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">ที่อยู่</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  placeholder="ที่อยู่โรงพยาบาล"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">โทรศัพท์</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0xx-xxx-xxxx"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">โทรสาร</label>
                <input
                  type="tel"
                  value={formData.fax}
                  onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                  placeholder="0xx-xxx-xxxx"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">อีเมล</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ปุ่ม */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : '💾 บันทึก'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/hospitals')}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}