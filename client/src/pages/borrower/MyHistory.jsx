import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function MyHistory() {
  const [records, setRecords] = useState([]);

  useEffect(() => { loadRecords(); }, []);

  async function loadRecords() {
    const res = await api.get('/borrows/my');
    setRecords(res.data);
  }

  const statusLabel = { pending: 'รออนุมัติ', approved: 'ยืมอยู่', rejected: 'ปฏิเสธ', returned: 'คืนแล้ว' };
  const statusColor = { pending: 'text-orange-600', approved: 'text-yellow-600', rejected: 'text-red-600', returned: 'text-green-600' };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">ประวัติของฉัน</h2>
      <div className="space-y-3">
        {records.map((r) => (
          <div key={r._id} className="bg-white rounded shadow p-4">
            <div className="flex justify-between">
              <div className="font-medium">{r.item?.name || '-'}</div>
              <span className={`text-sm font-medium ${statusColor[r.status]}`}>{statusLabel[r.status]}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              ขอเมื่อ: {new Date(r.createdAt).toLocaleDateString('th-TH')}
            </div>
            {(r.borrowImage || r.returnImage) && (
              <div className="flex gap-3 mt-2">
                {r.borrowImage && (
                  <div>
                    <span className="text-xs text-gray-400">รูปตอนยืม</span>
                    <img src={r.borrowImage} className="w-20 h-14 object-cover rounded border mt-1" />
                  </div>
                )}
                {r.returnImage && (
                  <div>
                    <span className="text-xs text-gray-400">รูปตอนคืน</span>
                    <img src={r.returnImage} className="w-20 h-14 object-cover rounded border mt-1" />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {records.length === 0 && <div className="text-gray-400 text-center py-8">ยังไม่มีประวัติ</div>}
      </div>
    </div>
  );
}
