'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface DrugRequest {
  id: number;
  requestNumber: string;
  hospitalId: number;
  hospital: { id: number; name: string; hospCode: string };
  requestDate: string;
  requiredDate: string | null;
  status: string;
  requestedBy: string | null;
  approvedBy: string | null;
  notes: string | null;
  items: Array<{
    id: number;
    drugId: number;
    quantity: number;
    approvedQuantity: number | null;
    notes: string | null;
    drug: {
      id: number;
      drugCode: string;
      name: string;
      unit: string;
      category: { name: string } | null;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

const STATUS_FLOW: Record<string, { next: string[]; label: string; color: string }> = {
  'PENDING': { next: ['APPROVED', 'REJECTED', 'CANCELLED'], label: 'รออนุมัติ', color: 'bg-yellow-100 text-yellow-800' },
  'APPROVED': { next: ['PROCESSING', 'CANCELLED'], label: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800' },
  'PROCESSING': { next: ['COMPLETED', 'CANCELLED'], label: 'กำลังเตรียม', color: 'bg-blue-100 text-blue-800' },
  'COMPLETED': { next: [], label: 'เสร็จสิ้น', color: 'bg-gray-100 text-gray-800' },
  'CANCELLED': { next: [], label: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
  'REJECTED': { next: [], label: 'ปฏิเสธ', color: 'bg-red-100 text-red-800' }
};

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [request, setRequest] = useState<DrugRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvedBy, setApprovedBy] = useState('');

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}`);
      const data = await res.json();
      if (data.success) {
        setRequest(data.data);
        setApprovedBy(data.data.approvedBy || '');
      }
    } catch (e) {
      console.error('Error fetching request:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'APPROVED') {
      setShowApproveModal(true);
      return;
    }

    if (!confirm(`คุณต้องการเปลี่ยนสถานะเป็น "${STATUS_FLOW[newStatus]?.label}" ใช่หรือไม่?`)) return;

    await updateStatus(newStatus);
  };

  const handleApprove = async () => {
    if (!approvedBy.trim()) {
      alert('กรุณากรอกชื่อผู้อนุมัติ');
      return;
    }
    await updateStatus('APPROVED', approvedBy);
    setShowApproveModal(false);
  };

  const updateStatus = async (status: string, approvedByValue?: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          approvedBy: approvedByValue
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert('อัปเดตสถานะเรียบร้อยแล้ว');
        fetchRequest();
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('คุณต้องการลบใบเบิกยานี้หรือไม่?\n\nรายการนี้จะถูกลบถาวร')) return;

    try {
      const res = await fetch(`/api/requests/${requestId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        alert('ลบใบเบิกยาเรียบร้อยแล้ว');
        router.push('/requests');
      } else {
        alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = STATUS_FLOW[status] || STATUS_FLOW['PENDING'];
    return (
      <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const canChangeStatus = (status: string) => {
    const statusInfo = STATUS_FLOW[status];
    return statusInfo && statusInfo.next.length > 0;
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

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">ไม่พบใบเบิกยา</div>
      </div>
    );
  }

  const statusInfo = STATUS_FLOW[request.status];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a href="/requests" className="text-blue-600 hover:underline">
          ← กลับไปหน้าใบเบิกยา
        </a>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{request.requestNumber}</h1>
            <p className="text-gray-500 mt-1">{request.hospital.name}</p>
          </div>
          <div className="text-right">
            {getStatusBadge(request.status)}
            <div className="text-sm text-gray-500 mt-2">
              วันที่เบิก: {new Date(request.requestDate).toLocaleDateString('th-TH')}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {statusInfo.next.map((nextStatus) => (
            <button
              key={nextStatus}
              onClick={() => handleStatusChange(nextStatus)}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {nextStatus === 'APPROVED' && '✓ อนุมัติ'}
              {nextStatus === 'REJECTED' && '✕ ปฏิเสธ'}
              {nextStatus === 'PROCESSING' && '📦 เริ่มเตรียม'}
              {nextStatus === 'COMPLETED' && '✅ เสร็จสิ้น'}
              {nextStatus === 'CANCELLED' && '❌ ยกเลิก'}
            </button>
          ))}
          {request.status === 'PENDING' && (
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              🗑️ ลบ
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">📋 ข้อมูลใบเบิก</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">โรงพยาบาล</div>
            <div className="font-medium">{request.hospital.name}</div>
            <div className="text-sm text-gray-500">{request.hospital.hospCode}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">ผู้เบิก</div>
            <div className="font-medium">{request.requestedBy || '-'}</div>
          </div>
          {request.approvedBy && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">ผู้อนุมัติ</div>
              <div className="font-medium">{request.approvedBy}</div>
            </div>
          )}
          {request.requiredDate && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">วันที่ต้องการ</div>
              <div className="font-medium">{new Date(request.requiredDate).toLocaleDateString('th-TH')}</div>
            </div>
          )}
          {request.notes && (
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <div className="text-sm text-gray-500">หมายเหตุ</div>
              <div className="font-medium">{request.notes}</div>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4">💊 รายการยา ({request.items.length} รายการ)</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">รหัสยา</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ชื่อยา</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">จำนวน</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">หมวด</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {request.items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {item.drug.drugCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.drug.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold">{item.quantity}</span>
                    <span className="text-gray-500 ml-1">{item.drug.unit}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {item.drug.category?.name || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {item.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">อนุมัติใบเบิกยา</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                ชื่อผู้อนุมัติ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="ชื่อผู้อนุมัติ"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={saving || !approvedBy.trim()}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'กำลังอนุมัติ...' : '✓ อนุมัติ'}
              </button>
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}