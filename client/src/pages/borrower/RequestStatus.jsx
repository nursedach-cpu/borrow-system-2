import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function RequestStatus() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadRequests() {
    const res = await api.get('/borrows/my');
    setRequests(res.data.filter((r) => r.status === 'pending' || r.status === 'rejected'));
  }

  const statusLabel = { pending: 'รออนุมัติ', rejected: 'ปฏิเสธ' };
  const statusColor = { pending: 'bg-orange-100 text-orange-700', rejected: 'bg-red-100 text-red-700' };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">สถานะคำขอ</h2>
      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r._id} className="bg-white rounded shadow p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{r.item?.name || '-'}</div>
                <div className="text-sm text-gray-500">
                  ขอเมื่อ: {new Date(r.createdAt).toLocaleDateString('th-TH')}
                </div>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${statusColor[r.status]}`}>
                {statusLabel[r.status]}
              </span>
            </div>
          </div>
        ))}
        {requests.length === 0 && <div className="text-gray-400 text-center py-8">ไม่มีคำขอที่รอดำเนินการ</div>}
      </div>
    </div>
  );
}
