import { useState, useEffect } from 'react';
import api from '../../api/client';
import { CheckCircle2, XCircle, Inbox, Calendar, User } from 'lucide-react';

export default function ApproveRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadRequests() {
    const res = await api.get('/borrows?status=pending');
    setRequests(res.data);
  }

  async function approve(id) {
    await api.put(`/borrows/${id}/approve`);
    loadRequests();
  }

  async function reject(id) {
    await api.put(`/borrows/${id}/reject`);
    loadRequests();
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-bold text-[#221f26]">อนุมัติคำขอยืม</h1>
          {requests.length > 0 && (
            <span className="badge bg-orange-50 text-[#d9730d] text-sm">{requests.length}</span>
          )}
        </div>
        <p className="text-sm text-[#6c6770]">รายการคำขอยืมที่รออนุมัติ</p>
      </div>

      <div className="space-y-2">
        {requests.map((r) => (
          <div key={r._id} className="notion-card hover:border-[#cfc8bd] transition-colors">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="font-semibold text-[#221f26] mb-1">{r.item?.name || 'ไม่ทราบ'}</div>
                <div className="flex items-center gap-1 text-sm text-[#6c6770]">
                  <User size={13} />
                  {r.borrower?.name} <span className="text-[#9d97a0]">·</span> {r.borrower?.department || '-'}
                </div>
                {r.dueDate && (
                  <div className="flex items-center gap-1 text-sm text-[#6c6770] mt-1">
                    <Calendar size={13} />
                    กำหนดคืน: {new Date(r.dueDate).toLocaleDateString('th-TH')}
                  </div>
                )}
                {r.note && <div className="text-sm text-[#6c6770] mt-1">หมายเหตุ: {r.note}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(r._id)}
                  className="inline-flex items-center gap-1 bg-[#0f7b6c] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#0d6b5e]">
                  <CheckCircle2 size={14} /> อนุมัติ
                </button>
                <button onClick={() => reject(r._id)}
                  className="inline-flex items-center gap-1 border border-[#e6e1da] text-[#c33b32] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-50">
                  <XCircle size={14} /> ปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="text-center py-12 text-[#6c6770]">
            <Inbox size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm">ไม่มีคำขอรออนุมัติ</div>
          </div>
        )}
      </div>
    </div>
  );
}
