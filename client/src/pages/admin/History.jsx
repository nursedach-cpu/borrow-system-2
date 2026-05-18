import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function History() {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('');

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
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-400">ไม่พบประวัติ</div>}
      </div>
    </div>
  );
}
