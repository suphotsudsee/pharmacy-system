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
  currentStock?: number;
}

interface Inventory {
  drugId: number;
  currentStock: number;
  drug: Drug;
}

export default function RequestFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [requestedBy, setRequestedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ drugId: '', quantity: 1, notes: '' }]);

  useEffect(() => {
    fetchHospitals();
    fetchDrugs();
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      fetchInventory(parseInt(selectedHospital));
    }
  }, [selectedHospital]);

  const fetchHospitals = async () => {
    try {
      const res = await fetch('/api/hospitals?limit=1000');
      const data = await res.json();
      if (data.success) setHospitals(data.data);
    } catch (e) {
      console.error('Error fetching hospitals:', e);
    }
  };

  const fetchDrugs = async () => {
    try {
      const res = await fetch('/api/drugs?limit=1000');
      const data = await res.json();
      if (data.success) setDrugs(data.data);
    } catch (e) {
      console.error('Error fetching drugs:', e);
    }
  };

  const fetchInventory = async (hospitalId: number) => {
    try {
      const res = await fetch(`/api/inventory?hospitalId=${hospitalId}&limit=1000`);
      const data = await res.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (e) {
      console.error('Error fetching inventory:', e);
    }
  };

  const addItem = () => {
    setItems([...items, { drugId: '', quantity: 1, notes: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: 'drugId' | 'quantity' | 'notes', value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index] = { ...newItems[index], [field]: parseInt(value as string) || 0 };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const getDrugStock = (drugId: number) => {
    const inv = inventory.find(i => i.drugId === drugId);
    return inv?.currentStock || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedHospital) {
      alert('กรุณาเลือกโรงพยาบาล');
      return;
    }

    const validItems = items.filter(item => item.drugId && item.quantity > 0);
    if (validItems.length === 0) {
      alert('กรุณาเพิ่มอย่างน้อย 1 รายการยา');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: parseInt(selectedHospital),
          requestedBy,
          notes,
          items: validItems.map(item => ({
            drugId: parseInt(item.drugId),
            quantity: item.quantity,
            notes: item.notes || null
          }))
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert('สร้างใบเบิกยาเรียบร้อยแล้ว');
        router.push('/requests');
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error creating request:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a href="/requests" className="text-blue-600 hover:underline">
          ← กลับไปหน้าใบเบิกยา
        </a>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">📝 สร้างใบเบิกยาใหม่</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* โรงพยาบาลและผู้เบิก */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                โรงพยาบาล <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
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
              <label className="block text-sm font-medium mb-1">ผู้เบิก</label>
              <input
                type="text"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                placeholder="ชื่อผู้เบิกยา"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* รายการยา */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">💊 รายการยาที่เบิก</h2>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + เพิ่มรายการ
              </button>
            </div>

            {selectedHospital && inventory.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-700">
                  ⚠️ โรงพยาบาลนี้ยังไม่มีรายการยาในคลัง กรุณาเพิ่มยาในคลังก่อน
                </p>
              </div>
            )}

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        ยา <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.drugId}
                        onChange={(e) => updateItem(index, 'drugId', e.target.value)}
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- เลือกยา --</option>
                        {drugs.map((d) => {
                          const stock = getDrugStock(d.id);
                          const drugInfo = selectedHospital && inventory.length > 0
                            ? ` (${stock} ${d.unit} คงเหลือ)`
                            : '';
                          const isDisabled = selectedHospital !== '' && stock === 0;
                          return (
                            <option key={d.id} value={d.id} disabled={isDisabled}>
                              {d.drugCode} - {d.name}{selectedHospital ? drugInfo : ''}
                            </option>
                          );
                        })}
                      </select>
                      {item.drugId && selectedHospital && (
                        <div className="text-sm text-gray-500 mt-1">
                          สต็อก: {getDrugStock(parseInt(item.drugId))} {drugs.find(d => d.id === parseInt(item.drugId))?.unit}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        จำนวน <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        min="1"
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">หมายเหตุ</label>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateItem(index, 'notes', e.target.value)}
                          placeholder="หมายเหตุ"
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* หมายเหตุ */}
          <div>
            <label className="block text-sm font-medium mb-1">หมายเหตุเพิ่มเติม</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="หมายเหตุหรือเหตุผลในการเบิก"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ปุ่ม */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !selectedHospital}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังสร้าง...' : '📝 สร้างใบเบิกยา'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/requests')}
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