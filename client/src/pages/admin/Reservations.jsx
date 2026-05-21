import { useState, useEffect } from 'react';
import api from '../../api/client';

const TYPE_LABEL = {
  queue: { th: 'จองคิว', color: 'bg-purple-100 text-purple-700' },
  extension: { th: 'ขอขยายเวลา', color: 'bg-amber-100 text-amber-700' },
  schedule: { th: 'จองล่วงหน้า', color: 'bg-sky-100 text-sky-700' },
};

const STATUS_LABEL = {
  pending: { th: 'รออนุมัติ', color: 'bg-yellow-100 text-yellow-800' },
  approved: { th: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800' },
  rejected: { th: 'ถูกปฏิเสธ', color: 'bg-red-100 text-red-700' },
  cancelled: { th: 'ยกเลิกแล้ว', color: 'bg-gray-100 text-gray-600' },
  fulfilled: { th: 'สำเร็จ', color: 'bg-blue-100 text-blue-700' },
  expired: { th: 'หมดอายุ', color: 'bg-gray-100 text-gray-600' },
};

function fmt(d) {
  return d ? new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
}

export default function AdminReservations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [typeFilter, statusFilter]);

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/reservations', { params });
      setList(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id) {
    setBusyId(id);
    try {
      await api.put(`/reservations/${id}/approve`);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'อนุมัติไม่สำเร็จ');
    } finally {
      setBusyId('');
    }
  }

  async function reject(id) {
    const reason = window.prompt('เหตุผลที่ปฏิเสธ (ไม่บังคับ):') || '';
    setBusyId(id);
    try {
      await api.put(`/reservations/${id}/reject`, { reason });
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'ปฏิเสธไม่สำเร็จ');
    } finally {
      setBusyId('');
    }
  }

  async function cancel(id) {
    if (!window.confirm('ยกเลิกการจองนี้?')) return;
    setBusyId(id);
    try {
      await api.delete(`/reservations/${id}`);
      await load();
    } finally {
      setBusyId('');
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">จัดการการจอง</h2>

      <div className="flex gap-2 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">ทุกประเภท</option>
          <option value="queue">จองคิว</option>
          <option value="extension">ขอขยายเวลา</option>
          <option value="schedule">จองล่วงหน้า</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">ทุกสถานะ</option>
          <option value="pending">รออนุมัติ</option>
          <option value="approved">อนุมัติแล้ว</option>
          <option value="fulfilled">สำเร็จ</option>
          <option value="rejected">ถูกปฏิเสธ</option>
          <option value="cancelled">ยกเลิกแล้ว</option>
        </select>
      </div>

      {loading && <div className="text-gray-400">กำลังโหลด...</div>}

      {!loading && list.length === 0 && (
        <div className="text-gray-400 text-center py-8 bg-white rounded shadow">
          ไม่มีรายการ
        </div>
      )}

      <div className="space-y-3">
        {list.map((r) => {
          const type = TYPE_LABEL[r.type];
          const status = STATUS_LABEL[r.status];
          const canApprove = r.status === 'pending';
          const canCancel = r.status === 'pending' || r.status === 'approved';

          return (
            <div key={r._id} className="bg-white rounded shadow p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${type.color}`}>{type.th}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>{status.th}</span>
                  </div>
                  <div className="font-medium">{r.item?.name || '-'}</div>
                  <div className="text-sm text-gray-600">
                    ผู้จอง: {r.user?.name || '-'}
                    {r.user?.department && <span className="text-gray-400"> · {r.user.department}</span>}
                  </div>

                  {r.type === 'extension' && (
                    <div className="text-sm text-gray-600 mt-1">
                      ขอเปลี่ยนวันคืนเป็น: <span className="font-medium">{fmt(r.newDueDate)}</span>
                    </div>
                  )}
                  {r.type === 'schedule' && (
                    <div className="text-sm text-gray-600 mt-1">
                      {fmt(r.startDate)} – {fmt(r.endDate)}
                    </div>
                  )}

                  {r.note && <div className="text-sm text-gray-500 mt-1">หมายเหตุ: {r.note}</div>}
                  {r.rejectedReason && (
                    <div className="text-sm text-red-600 mt-1">เหตุผล: {r.rejectedReason}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(r.createdAt).toLocaleString('th-TH')}
                  </div>
                </div>

                <div className="flex flex-col gap-1 min-w-[120px]">
                  {canApprove && (
                    <>
                      <button
                        onClick={() => approve(r._id)}
                        disabled={busyId === r._id}
                        className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => reject(r._id)}
                        disabled={busyId === r._id}
                        className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded hover:bg-red-200 disabled:opacity-50"
                      >
                        ปฏิเสธ
                      </button>
                    </>
                  )}
                  {canCancel && !canApprove && (
                    <button
                      onClick={() => cancel(r._id)}
                      disabled={busyId === r._id}
                      className="text-sm text-gray-600 hover:text-red-700 px-3 py-1"
                    >
                      ยกเลิก
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
