import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function History() {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { loadRecords(); }, []);

  async function loadRecords() {
    const res = await api.get('/borrows');
    setRecords(res.data);
  }

  const statusLabel = { pending: 'รออนุมัติ', approved: 'ยืมอยู่', rejected: 'ปฏิเสธ', returned: 'คืนแล้ว' };
  const statusColor = { pending: 'text-orange-600', approved: 'text-yellow-600', rejected: 'text-red-600', returned: 'text-green-600' };

  const filtered = records.filter((r) => {
    if (!filter) return true;
    const text = filter.toLowerCase();
    return (
      r.item?.name?.toLowerCase().includes(text) ||
      r.borrower?.name?.toLowerCase().includes(text) ||
      r.borrower?.email?.toLowerCase().includes(text)
    );
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">ประวัติทั้งหมด</h2>
      <input placeholder="ค้นหา (ชื่อของ, ชื่อผู้ยืม, อีเมล)..." value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-full max-w-md" />
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">อุปกรณ์</th>
              <th className="text-left px-4 py-3">ผู้ยืม</th>
              <th className="text-left px-4 py-3">สถานะ</th>
              <th className="text-left px-4 py-3">วันยืม</th>
              <th className="text-left px-4 py-3">กำหนดคืน</th>
              <th className="text-left px-4 py-3">วันคืน</th>
              <th className="text-left px-4 py-3">รูปถ่าย</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="px-4 py-3">{r.item?.name || '-'}</td>
                <td className="px-4 py-3">{r.borrower?.name || '-'}</td>
                <td className={`px-4 py-3 font-medium ${statusColor[r.status]}`}>{statusLabel[r.status]}</td>
                <td className="px-4 py-3">{r.borrowDate ? new Date(r.borrowDate).toLocaleDateString('th-TH') : '-'}</td>
                <td className="px-4 py-3">{r.dueDate ? new Date(r.dueDate).toLocaleDateString('th-TH') : '-'}</td>
                <td className="px-4 py-3">{r.returnDate ? new Date(r.returnDate).toLocaleDateString('th-TH') : '-'}</td>
                <td className="px-4 py-3">
                  {(r.borrowImage || r.returnImage) ? (
                    <button onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
                      className="text-blue-600 underline text-xs">
                      {expandedId === r._id ? 'ซ่อน' : 'ดูรูป'}
                    </button>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-400">ไม่พบประวัติ</div>}
      </div>

      {expandedId && (() => {
        const r = records.find((rec) => rec._id === expandedId);
        if (!r) return null;
        return (
          <div className="mt-4 bg-white rounded shadow p-4 max-w-lg">
            <h3 className="font-medium mb-3">{r.item?.name} — รูปถ่ายประกอบ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">รูปตอนยืม</span>
                {r.borrowImage ? (
                  <img src={r.borrowImage} className="w-full h-32 object-cover rounded border mt-1" />
                ) : (
                  <div className="text-xs text-gray-300 mt-1">ไม่มีรูป</div>
                )}
              </div>
              <div>
                <span className="text-xs text-gray-500">รูปตอนคืน</span>
                {r.returnImage ? (
                  <img src={r.returnImage} className="w-full h-32 object-cover rounded border mt-1" />
                ) : (
                  <div className="text-xs text-gray-300 mt-1">ไม่มีรูป</div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
