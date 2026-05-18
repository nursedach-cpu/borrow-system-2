import { useState, useEffect } from 'react';
import api from '../../api/client';

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
    const dueDate = prompt('กำหนดคืน (YYYY-MM-DD, เว้นว่างถ้าไม่กำหนด):');
    await api.put(`/borrows/${id}/approve`, dueDate ? { dueDate } : {});
    loadRequests();
  }

  async function reject(id) {
    await api.put(`/borrows/${id}/reject`);
    loadRequests();
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        อนุมัติคำขอยืม
        {requests.length > 0 && (
          <span className="ml-2 bg-orange-500 text-white text-sm px-2 py-0.5 rounded-full">
            {requests.length}
          </span>
        )}
      </h2>
      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r._id} className="bg-white rounded shadow p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">{r.item?.name || 'ไม่ทราบ'}</div>
              <div className="text-sm text-gray-500">
                ผู้ขอ: {r.borrower?.name} ({r.borrower?.department || '-'})
              </div>
              {r.dueDate && (
                <div className="text-sm text-gray-500">
                  กำหนดคืน: {new Date(r.dueDate).toLocaleDateString('th-TH')}
                </div>
              )}
              {r.note && <div className="text-sm text-gray-400">หมายเหตุ: {r.note}</div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => approve(r._id)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">อนุมัติ</button>
              <button onClick={() => reject(r._id)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">ปฏิเสธ</button>
            </div>
          </div>
        ))}
        {requests.length === 0 && <div className="text-gray-400 text-center py-8">ไม่มีคำขอรออนุมัติ</div>}
      </div>
    </div>
  );
}
