import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Clock, Calendar } from 'lucide-react';

export default function MyHistory() {
  const [records, setRecords] = useState([]);

  useEffect(() => { loadRecords(); }, []);

  async function loadRecords() {
    const res = await api.get('/borrows/my');
    setRecords(res.data);
  }

  const statusStyle = {
    pending: { th: 'รออนุมัติ', cls: 'bg-yellow-50 text-[#cb6a00]' },
    approved: { th: 'ยืมอยู่', cls: 'bg-orange-50 text-[#d9730d]' },
    rejected: { th: 'ปฏิเสธ', cls: 'bg-red-50 text-[#c33b32]' },
    returned: { th: 'คืนแล้ว', cls: 'bg-green-50 text-[#0f7b6c]' },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#221f26] mb-1">ประวัติของฉัน</h1>
        <p className="text-sm text-[#6c6770]">รายการยืม-คืนทั้งหมดของคุณ</p>
      </div>

      <div className="space-y-2">
        {records.map((r) => {
          const s = statusStyle[r.status];
          return (
            <div key={r._id} className="notion-card">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-[#221f26]">{r.item?.name || '-'}</div>
                  <div className="flex items-center gap-1 text-sm text-[#6c6770] mt-1">
                    <Calendar size={13} /> ขอเมื่อ: {new Date(r.createdAt).toLocaleDateString('th-TH')}
                  </div>
                </div>
                <span className={`badge ${s.cls}`}>{s.th}</span>
              </div>
              {(r.borrowImage || r.returnImage) && (
                <div className="flex gap-3 mt-3">
                  {r.borrowImage && (
                    <div>
                      <span className="text-xs text-[#9d97a0]">รูปตอนยืม</span>
                      <img src={r.borrowImage} className="w-20 h-14 object-cover rounded border border-[#e6e1da] mt-1" />
                    </div>
                  )}
                  {r.returnImage && (
                    <div>
                      <span className="text-xs text-[#9d97a0]">รูปตอนคืน</span>
                      <img src={r.returnImage} className="w-20 h-14 object-cover rounded border border-[#e6e1da] mt-1" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {records.length === 0 && (
          <div className="text-center py-12 text-[#6c6770]">
            <Clock size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm">ยังไม่มีประวัติ</div>
          </div>
        )}
      </div>
    </div>
  );
}
