import { useState, useEffect, Fragment } from 'react';
import api from '../api/client';

// Tiny wrapper so we can pass `key` to a Fragment-equivalent.
// (React.Fragment supports key, but the <>...</> shorthand does not.)
const FragmentRow = Fragment;

const STATUS_LABEL = {
  available: { th: 'ว่าง', color: 'bg-green-100 text-green-700' },
  borrowed: { th: 'ถูกยืม', color: 'bg-yellow-100 text-yellow-800' },
  maintenance: { th: 'ซ่อม', color: 'bg-gray-200 text-gray-700' },
};

const BORROW_STATUS_LABEL = {
  pending: { th: 'รออนุมัติ', color: 'bg-yellow-100 text-yellow-800' },
  approved: { th: 'ยืมอยู่', color: 'bg-violet-100 text-blue-700' },
  rejected: { th: 'ถูกปฏิเสธ', color: 'bg-red-100 text-red-700' },
  returned: { th: 'คืนแล้ว', color: 'bg-green-100 text-green-700' },
};

function fmt(d) {
  return d ? new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
}

function fmtDateTime(d) {
  return d ? new Date(d).toLocaleString('th-TH') : '-';
}

export default function ItemBorrowStats() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('most');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState('');
  const [historyMap, setHistoryMap] = useState({}); // id → records[]

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [sort]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/item-stats', { params: { sort, limit: 200 } });
      setRows(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function toggle(id) {
    if (expandedId === id) {
      setExpandedId('');
      return;
    }
    setExpandedId(id);
    if (!historyMap[id]) {
      try {
        const res = await api.get(`/dashboard/items/${id}/history`);
        setHistoryMap((m) => ({ ...m, [id]: res.data }));
      } catch (err) {
        setHistoryMap((m) => ({ ...m, [id]: [] }));
      }
    }
  }

  const filtered = rows.filter((r) =>
    !search.trim() || r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-6 bg-white rounded-lg shadow">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b">
        <div>
          <h3 className="font-bold">รายการยืมของอุปกรณ์แต่ละตัว</h3>
          <p className="text-xs text-gray-500 mt-0.5">คลิกที่แถวเพื่อดูประวัติการยืมทั้งหมด</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา..."
            className="border rounded px-3 py-1.5 text-sm"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm"
          >
            <option value="most">ถูกยืมมากที่สุด</option>
            <option value="recent">ยืมล่าสุด</option>
            <option value="alpha">ตามชื่อ A-Z</option>
          </select>
        </div>
      </div>

      {loading && <div className="p-6 text-center text-gray-400">กำลังโหลด...</div>}

      {!loading && filtered.length === 0 && (
        <div className="p-8 text-center text-gray-400">ไม่พบอุปกรณ์</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left p-3 font-medium">อุปกรณ์</th>
              <th className="text-left p-3 font-medium">สถานะ</th>
              <th className="text-center p-3 font-medium">ยืมทั้งหมด</th>
              <th className="text-center p-3 font-medium">ยืมอยู่</th>
              <th className="text-center p-3 font-medium">รอคิว</th>
              <th className="text-left p-3 font-medium">ยืมล่าสุด</th>
              <th className="text-left p-3 font-medium">ผู้ยืมปัจจุบัน</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const status = STATUS_LABEL[r.status] || STATUS_LABEL.available;
              const overdue =
                r.currentBorrower?.dueDate &&
                new Date(r.currentBorrower.dueDate) < new Date();
              const expanded = expandedId === r._id;

              return (
                <FragmentRow key={r._id}>
                  <tr
                    onClick={() => toggle(r._id)}
                    className={`border-t hover:bg-gray-50 cursor-pointer ${expanded ? 'bg-violet-50' : ''}`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {r.imageUrl ? (
                          <img src={r.imageUrl} className="w-10 h-10 object-cover rounded" alt="" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                            📦
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{r.name}</div>
                          {r.category && <div className="text-xs text-gray-500">{r.category}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>{status.th}</span>
                    </td>
                    <td className="p-3 text-center font-medium">{r.totalBorrows}</td>
                    <td className="p-3 text-center">
                      {r.activeBorrows > 0 ? (
                        <span className="text-blue-700 font-medium">{r.activeBorrows}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {r.queueCount > 0 ? (
                        <span className="text-purple-700 font-medium">{r.queueCount}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-600">{fmt(r.lastBorrowDate)}</td>
                    <td className="p-3">
                      {r.currentBorrower ? (
                        <div>
                          <div className="font-medium">{r.currentBorrower.name || '-'}</div>
                          {r.currentBorrower.dueDate && (
                            <div className={`text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                              กำหนดคืน: {fmt(r.currentBorrower.dueDate)}
                              {overdue && ' ⚠️'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr className="bg-violet-50/50">
                      <td colSpan={7} className="p-4">
                        <div className="font-medium text-sm mb-2">📜 ประวัติการยืม</div>
                        {!historyMap[r._id] && (
                          <div className="text-gray-400 text-sm">กำลังโหลด...</div>
                        )}
                        {historyMap[r._id] && historyMap[r._id].length === 0 && (
                          <div className="text-gray-400 text-sm">ยังไม่มีประวัติการยืม</div>
                        )}
                        {historyMap[r._id] && historyMap[r._id].length > 0 && (
                          <div className="bg-white rounded border overflow-hidden">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                  <th className="text-left p-2">วันที่ยืม</th>
                                  <th className="text-left p-2">ผู้ยืม</th>
                                  <th className="text-left p-2">กำหนดคืน</th>
                                  <th className="text-left p-2">วันคืน</th>
                                  <th className="text-left p-2">สถานะ</th>
                                  <th className="text-left p-2">หมายเหตุ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {historyMap[r._id].map((h) => {
                                  const bs = BORROW_STATUS_LABEL[h.status] || {};
                                  return (
                                    <tr key={h._id} className="border-t">
                                      <td className="p-2">{fmtDateTime(h.borrowDate || h.createdAt)}</td>
                                      <td className="p-2">
                                        {h.borrower?.name || '-'}
                                        {h.borrower?.department && (
                                          <span className="text-gray-400"> · {h.borrower.department}</span>
                                        )}
                                      </td>
                                      <td className="p-2">{fmt(h.dueDate)}</td>
                                      <td className="p-2">{fmt(h.returnDate)}</td>
                                      <td className="p-2">
                                        <span className={`px-1.5 py-0.5 rounded ${bs.color || ''}`}>
                                          {bs.th || h.status}
                                        </span>
                                      </td>
                                      <td className="p-2 text-gray-600">{h.note || '-'}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </FragmentRow>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
