'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type ImportTab = 'hospitals' | 'drugs' | 'inventory';

interface ImportResult {
  success: boolean;
  data?: {
    total: number;
    created?: number;
    updated?: number;
    errors?: string[];
    hospital?: string;
  };
  error?: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ImportTab>('hospitals');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hospitalId, setHospitalId] = useState<string>('');
  const [hospitals, setHospitals] = useState<any[]>([]);

  // Fetch hospitals for inventory import
  const fetchHospitals = useCallback(async () => {
    try {
      const res = await fetch('/api/hospitals?limit=1000');
      const data = await res.json();
      if (data.success) {
        setHospitals(data.data);
      }
    } catch (e) {
      console.error('Error fetching hospitals:', e);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!file) {
      setError('กรุณาเลือกไฟล์ Excel');
      return;
    }

    if (activeTab === 'inventory' && !hospitalId) {
      setError('กรุณาเลือกโรงพยาบาล');
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (activeTab === 'inventory') {
        formData.append('hospitalId', hospitalId);
      }

      const endpoints: Record<ImportTab, string> = {
        hospitals: '/api/import/excel',
        drugs: '/api/import/drugs',
        inventory: '/api/import/inventory'
      };

      const res = await fetch(endpoints[activeTab], {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setImporting(false);
    }
  }, [file, activeTab, hospitalId]);

  const getColumnInfo = () => {
    switch (activeTab) {
      case 'hospitals':
        return {
          title: 'นำเข้าโรงพยาบาล',
          columns: [
            'Hosp_Code / รหัส / code - รหัสโรงพยาบาล *',
            'Hosp_Name / ชื่อ / name - ชื่อโรงพยาบาล *',
            'short_name / ชื่อย่อ - ชื่อย่อ',
            'link / ลิงก์ - Google Sheets link',
            'ประเภทสถานบริการ / type - ประเภท'
          ]
        };
      case 'drugs':
        return {
          title: 'นำเข้ารายการยา',
          columns: [
            'drugCode / รหัสยา / code - รหัสยา *',
            'name / ชื่อยา / DrugName - ชื่อยา *',
            'genericName / ชื่อสามัญ - ชื่อสามัญ',
            'category / หมวดยา - หมวดหมู่ (ยาปฏิชีวนะ, ยาแก้ปวด, ฯลฯ)',
            'dosageForm / รูปแบบยา - เม็ด, แคปซูล, ฉีด, ฯลฯ',
            'strength / ความแรง - ความแรง (เช่น 500 mg)',
            'unit / หน่วย - เม็ด, ขวด, หลอด, ฯลฯ *',
            'minStock / สต็อกขั้นต่ำ - จำนวนขั้นต่ำ',
            'maxStock / สต็อกสูงสุด - จำนวนสูงสุด',
            'reorderPoint / จุดสั่งซื้อ - จุดสั่งซื้อใหม่',
            'unitPrice / ราคา - ราคาต่อหน่วย'
          ]
        };
      case 'inventory':
        return {
          title: 'นำเข้าข้อมูลคลังยา',
          columns: [
            'Hosp_Code / รหัสโรงพยาบาล * - รหัสโรงพยาบาล (จำเป็น)',
            'drugCode / รหัสยา * - รหัสยา',
            'drugName / ชื่อยา - ชื่อยา (ถ้าไม่มีรหัส)',
            'quantity / จำนวน * - จำนวนสต็อก',
            'lotNumber / หมายเลขล็อต - หมายเลขล็อต',
            'expiryDate / วันหมดอายุ - วันหมดอายุ',
            'location / ที่เก็บ - ที่เก็บ (ชั้น, ห้อง)'
          ]
        };
    }
  };

  const info = getColumnInfo();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">📥 นำเข้าข้อมูล</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {[
          { key: 'hospitals', label: 'โรงพยาบาล' },
          { key: 'drugs', label: 'รายการยา' },
          { key: 'inventory', label: 'คลังยา' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as ImportTab);
              setFile(null);
              setResult(null);
              setError(null);
              if (tab.key === 'inventory') {
                fetchHospitals();
              }
            }}
            className={`px-6 py-3 font-medium ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Import Form */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">{info.title}</h2>

        {/* Hospital Selection for Inventory */}
        {activeTab === 'inventory' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              เลือกโรงพยาบาล <span className="text-red-500">*</span>
            </label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- เลือกโรงพยาบาล --</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name} ({h.hospCode})</option>
              ))}
            </select>
          </div>
        )}

        {/* File Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            เลือกไฟล์ Excel <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border rounded-lg px-4 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            รองรับไฟล์ .xlsx, .xls
          </p>
        </div>

        {/* Column Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-2">📋 รูปแบบคอลัมน์ที่รองรับ:</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            {info.columns.map((col, i) => (
              <li key={i}>• {col}</li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            * จำเป็นต้องมี
          </p>
        </div>

        {/* Import Button */}
        <button
          onClick={handleImport}
          disabled={!file || importing || (activeTab === 'inventory' && !hospitalId)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              กำลังนำเข้า...
            </span>
          ) : (
            '📤 นำเข้าข้อมูล'
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            ❌ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`mt-4 rounded-lg p-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {result.success ? (
              <>
                <h3 className="font-medium text-green-800 mb-2">✅ นำเข้าสำเร็จ!</h3>
                <div className="text-sm text-green-700 space-y-1">
                  {result.data?.hospital && (
                    <p><strong>โรงพยาบาล:</strong> {result.data.hospital}</p>
                  )}
                  <p><strong>ทั้งหมด:</strong> {result.data?.total} รายการ</p>
                  {result.data?.created !== undefined && (
                    <p><strong>สร้างใหม่:</strong> {result.data.created} รายการ</p>
                  )}
                  {result.data?.updated !== undefined && (
                    <p><strong>อัปเดต:</strong> {result.data.updated} รายการ</p>
                  )}
                  {result.data?.errors && result.data.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-red-600">ข้อผิดพลาด ({result.data.errors.length}):</p>
                      <ul className="list-disc list-inside text-red-600">
                        {result.data.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                        {result.data.errors.length > 5 && (
                          <li>...และอีก {result.data.errors.length - 5} รายการ</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-red-700">
                ❌ {result.error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sample Templates */}
      <div className="mt-6 bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">📄 ไฟล์ตัวอย่าง</h2>
        <p className="text-gray-600 mb-4">
          ดาวน์โหลดไฟล์ตัวอย่างเพื่อดูรูปแบบที่ถูกต้อง
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => downloadTemplate('hospitals')}
            className="border rounded-lg p-4 hover:bg-gray-50 text-left"
          >
            <div className="text-2xl mb-2">🏥</div>
            <div className="font-medium">โรงพยาบาล</div>
            <div className="text-sm text-gray-500">hospital_template.xlsx</div>
          </button>
          <button
            onClick={() => downloadTemplate('drugs')}
            className="border rounded-lg p-4 hover:bg-gray-50 text-left"
          >
            <div className="text-2xl mb-2">💊</div>
            <div className="font-medium">รายการยา</div>
            <div className="text-sm text-gray-500">drugs_template.xlsx</div>
          </button>
          <button
            onClick={() => downloadTemplate('inventory')}
            className="border rounded-lg p-4 hover:bg-gray-50 text-left"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-medium">คลังยา</div>
            <div className="text-sm text-gray-500">inventory_template.xlsx</div>
          </button>
        </div>
      </div>

      <div className="mt-6">
        <a href="/" className="text-blue-600 hover:underline">
          ← กลับหน้าหลัก
        </a>
      </div>
    </div>
  );
}

// Template download function
function downloadTemplate(type: 'hospitals' | 'drugs' | 'inventory') {
  const templates = {
    hospitals: [
      { 'Hosp_Code': 'EA0010001', 'Hosp_Name': 'โรงพยาบาลตัวอย่าง', 'short_name': 'รพ.ตัวอย่าง', 'type': 'รพ.สต.' }
    ],
    drugs: [
      { 'drugCode': 'DRUG001', 'name': 'ยาตัวอย่าง', 'genericName': 'Generic Name', 'category': 'ยาแก้ปวด', 'dosageForm': 'เม็ด', 'strength': '500 mg', 'unit': 'เม็ด', 'minStock': 100, 'maxStock': 5000, 'reorderPoint': 500, 'unitPrice': 1.50 }
    ],
    inventory: [
      { 'Hosp_Code': 'EA0010669', 'drugCode': 'DRUG001', 'drugName': 'ยาตัวอย่าง', 'quantity': 500, 'lotNumber': 'LOT001', 'expiryDate': '2026-12-31', 'location': 'ชั้น 1' }
    ]
  };

  // Create CSV content
  const data = templates[type];
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify(row[h as keyof typeof row])).join(','))
  ].join('\n');

  // Download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type}_template.csv`;
  link.click();
  URL.revokeObjectURL(url);
}