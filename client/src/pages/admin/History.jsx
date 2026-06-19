import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Search, History as HistoryIcon, Image as ImageIcon } from 'lucide-react';

export default function History() {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { loadRecords(); }, []);

  async function loadRecords() {
    const res = await api.get('/borrows');
    setRecords(res.data);
  }

  const statusStyle = {
    pending: { th: 'รออนุมัติ', cls: 'bg-yellow-50 text-[#cb6a00]' },
    approved: { th: 'ยืมอยู่', cls: 'bg-orange-50 text-[#d9730d]' },
    rejected: { th: 'ปฏิเสธ', cls: 'bg-red-50 text-[#c33b32]' },
    returned: { th: 'คืนแล้ว', cls: 'bg-green-50 text-[#0f7b6c]' },
  };

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#221f26] mb-1">ประวัติทั้งหมด</h1>
        <p className="text-sm text-[#6c6770]">รายการประวัติยืม-คืนทุกรายการ</p>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6770]" />
        <input
          placeholder="ค้นหา (ชื่อของ, ชื่อผู้ยืม, อีเมล)..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="notion-input pl-9"
        />
      </div>

      <div className="bg-white border border-[#e6e1da] rounded-lg overflow-hidden">
        <table className="notion-table">
          <thead>
            <tr>
              <th>อุปกรณ์</th>
              <th>ผู้ยืม</th>
              <th>สถานะ</th>
              <th>วันยืม</th>
              <th>กำหนดคืน</th>
              <th>วันคืน</th>
              <th>รูปถ่าย</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const s = statusStyle[r.status] || { th: r.status, cls: 'bg-[#f3f0ea] text-[#6c6770]' };
              return (
                <tr key={r._id}>
                  <td className="font-medium text-[#221f26]">{r.item?.name || '-'}</td>
                  <td className="text-[#6c6770]">{r.borrower?.name || '-'}</td>
                  <td><span className={`badge ${s.cls}`}>{s.th}</span></td>
                  <td className="text-[#6c6770]">{r.borrowDate ? new Date(r.borrowDate).toLocaleDateString('th-TH') : '-'}</td>
                  <td className="text-[#6c6770]">{r.dueDate ? new Date(r.dueDate).toLocaleDateString('th-TH') : '-'}</td>
                  <td className="text-[#6c6770]">{r.returnDate ? new Date(r.returnDate).toLocaleDateString('th-TH') : '-'}</td>
                  <td>
                    {(r.borrowImage || r.returnImage) ? (
                      <button onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
                        className="inline-flex items-center gap-1 text-[#6a2c8f] hover:bg-violet-50 px-2 py-1 rounded text-xs">
                        <ImageIcon size={13} /> {expandedId === r._id ? 'ซ่อน' : 'ดูรูป'}
                      </button>
                    ) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#6c6770]">
            <HistoryIcon size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm">ไม่พบประวัติ</div>
          </div>
        )}
      </div>

      {expandedId && (() => {
        const r = records.find((rec) => rec._id === expandedId);
        if (!r) return null;
        return (
          <div className="mt-4 notion-card max-w-lg">
            <h3 className="font-semibold text-[#221f26] mb-3">{r.item?.name} — รูปถ่ายประกอบ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-[#6c6770]">รูปตอนยืม</span>
                {r.borrowImage ? (
                  <img src={r.borrowImage} className="w-full h-32 object-cover rounded border border-[#e6e1da] mt-1" />
                ) : (
                  <div className="text-xs text-[#9d97a0] mt-1">ไม่มีรูป</div>
                )}
              </div>
              <div>
                <span className="text-xs text-[#6c6770]">รูปตอนคืน</span>
                {r.returnImage ? (
                  <img src={r.returnImage} className="w-full h-32 object-cover rounded border border-[#e6e1da] mt-1" />
                ) : (
                  <div className="text-xs text-[#9d97a0] mt-1">ไม่มีรูป</div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
