import { useState, useEffect } from 'react';
import api from '../../api/client';
import { ClipboardList, Calendar } from 'lucide-react';

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

  const statusStyle = {
    pending: { th: 'รออนุมัติ', cls: 'bg-yellow-50 text-[#cb6a00]' },
    rejected: { th: 'ปฏิเสธ', cls: 'bg-red-50 text-[#c33b32]' },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#221f26] mb-1">สถานะคำขอ</h1>
        <p className="text-sm text-[#6c6770]">คำขอยืมที่รอดำเนินการ</p>
      </div>

      <div className="space-y-2">
        {requests.map((r) => {
          const s = statusStyle[r.status];
          return (
            <div key={r._id} className="notion-card">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <div className="font-semibold text-[#221f26]">{r.item?.name || '-'}</div>
                  <div className="flex items-center gap-1 text-sm text-[#6c6770] mt-1">
                    <Calendar size={13} /> ขอเมื่อ: {new Date(r.createdAt).toLocaleDateString('th-TH')}
                  </div>
                </div>
                <span className={`badge ${s.cls}`}>{s.th}</span>
              </div>
            </div>
          );
        })}
        {requests.length === 0 && (
          <div className="text-center py-12 text-[#6c6770]">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm">ไม่มีคำขอที่รอดำเนินการ</div>
          </div>
        )}
      </div>
    </div>
  );
}
