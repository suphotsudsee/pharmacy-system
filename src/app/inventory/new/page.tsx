'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Hospital {
  id: number;
  name: string;
  hospCode: string;
}

interface Drug {
  id: number;
  drugCode: string;
  name: string;
  unit: string;
  minStock: number;
  reorderPoint: number;
  maxStock: number;
}

export default function InventoryFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  
  const [formData, setFormData] = useState({
    hospitalId: '',
    drugId: '',
    lotNumber: '',
    expiryDate: '',
    currentStock: 0,
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [hospitalsRes, drugsRes] = await Promise.all([
        fetch('/api/hospitals?limit=1000'),
        fetch('/api/drugs?limit=1000')
      ]);
      
      const hospitalsData = await hospitalsRes.json();
      const drugsData = await drugsRes.json();
      
      if (hospitalsData.success) setHospitals(hospitalsData.data);
      if (drugsData.success) setDrugs(drugsData.data);
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: parseInt(formData.hospitalId),
          drugId: parseInt(formData.drugId),
          lotNumber: formData.lotNumber || null,
          expiryDate: formData.expiryDate || null,
          currentStock: parseInt(formData.currentStock.toString()) || 0,
          location: formData.location || null,
          notes: formData.notes || null
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert('เพิ่มรายการคลังยาเรียบร้อยแล้ว');
        router.push('/inventory');
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error creating inventory:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const selectedDrug = drugs.find(d => d.id === parseInt(formData.drugId));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a href="/inventory" className="text-blue-600 hover:underline">
          ← กลับไปหน้าคลังยา
        </a>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">📦 เพิ่มรายการคลังยา</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* เลือกโรงพยาบาลและยา */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                โรงพยาบาล <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- เลือกโรงพยาบาล --</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>{h.name} ({h.hospCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                ยา <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.drugId}
                onChange={(e) => setFormData({ ...formData, drugId: e.target.value })}
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- เลือกยา --</option>
                {drugs.map((d) => (
                  <option key={d.id} value={d.id}>{d.drugCode} - {d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ข้อมูลยาที่เลือก */}
          {selectedDrug && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">📋 ข้อมูลยา</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">หน่วย:</span>
                  <span className="ml-1 font-medium">{selectedDrug.unit}</span>
                </div>
                <div>
                  <span className="text-gray-500">สต็อกขั้นต่ำ:</span>
                  <span className="ml-1 font-medium">{selectedDrug.minStock}</span>
                </div>
                <div>
                  <span className="text-gray-500">จุดสั่งซื้อ:</span>
                  <span className="ml-1 font-medium">{selectedDrug.reorderPoint}</span>
                </div>
              </div>
            </div>
          )}

          {/* รายละเอียดสต็อก */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-medium mb-4">📦 รายละเอียดสต็อก</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  จำนวน <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  required
                  min="0"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">หมายเลขล็อต (Lot No.)</label>
                <input
                  type="text"
                  value={formData.lotNumber}
                  onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                  placeholder="เช่น LOT001"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">วันหมดอายุ</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ที่เก็บและหมายเหตุ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">ที่เก็บ</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="เช่น ชั้น 1, ห้องยา, ตู้ A"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">หมายเหตุ</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="หมายเหตุเพิ่มเติม"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ปุ่ม */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.hospitalId || !formData.drugId}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังบันทึก...' : '💾 บันทึก'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/inventory')}
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