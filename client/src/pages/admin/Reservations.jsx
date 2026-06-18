import { useState, useEffect } from 'react';
import api from '../../api/client';
import { CheckCircle2, XCircle, CalendarClock, Inbox } from 'lucide-react';

const TYPE_LABEL = {
  queue: { th: 'จองคิว', cls: 'bg-purple-50 text-[#7c3aed]' },
  extension: { th: 'ขอขยายเวลา', cls: 'bg-amber-50 text-[#d9730d]' },
  schedule: { th: 'จองล่วงหน้า', cls: 'bg-sky-50 text-[#2383e2]' },
};

const STATUS_LABEL = {
  pending: { th: 'รออนุมัติ', cls: 'bg-yellow-50 text-[#cb6a00]' },
  approved: { th: 'อนุมัติแล้ว', cls: 'bg-green-50 text-[#0f7b6c]' },
  rejected: { th: 'ถูกปฏิเสธ', cls: 'bg-red-50 text-[#e03e3e]' },
  cancelled: { th: 'ยกเลิกแล้ว', cls: 'bg-[#f7f6f3] text-[#787774]' },
  fulfilled: { th: 'สำเร็จ', cls: 'bg-blue-50 text-[#2383e2]' },
  expired: { th: 'หมดอายุ', cls: 'bg-[#f7f6f3] text-[#787774]' },
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#37352f] mb-1">จัดการการจอง</h1>
        <p className="text-sm text-[#787774]">อนุมัติ ปฏิเสธ การจองคิว ขยายเวลา และจองล่วงหน้า</p>
      </div>

      <div className="flex gap-2 mb-4">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="notion-input max-w-[180px]">
          <option value="">ทุกประเภท</option>
          <option value="queue">จองคิว</option>
          <option value="extension">ขอขยายเวลา</option>
          <option value="schedule">จองล่วงหน้า</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="notion-input max-w-[180px]">
          <option value="">ทุกสถานะ</option>
          <option value="pending">รออนุมัติ</option>
          <option value="approved">อนุมัติแล้ว</option>
          <option value="fulfilled">สำเร็จ</option>
          <option value="rejected">ถูกปฏิเสธ</option>
          <option value="cancelled">ยกเลิกแล้ว</option>
        </select>
      </div>

      {loading && <div className="text-[#787774] text-sm">กำลังโหลด...</div>}

      {!loading && list.length === 0 && (
        <div className="text-center py-12 text-[#787774] notion-card">
          <Inbox size={32} className="mx-auto mb-2 opacity-40" />
          <div className="text-sm">ไม่มีรายการ</div>
        </div>
      )}

      <div className="space-y-2">
        {list.map((r) => {
          const type = TYPE_LABEL[r.type];
          const status = STATUS_LABEL[r.status];
          const canApprove = r.status === 'pending';
          const canCancel = r.status === 'pending' || r.status === 'approved';

          return (
            <div key={r._id} className="notion-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${type.cls}`}>{type.th}</span>
                    <span className={`badge ${status.cls}`}>{status.th}</span>
                  </div>
                  <div className="font-semibold text-[#37352f]">{r.item?.name || '-'}</div>
                  <div className="text-sm text-[#787774] mt-1">
                    ผู้จอง: {r.user?.name || '-'}
                    {r.user?.department && <span className="text-[#aeacaa]"> · {r.user.department}</span>}
                  </div>

                  {r.type === 'extension' && (
                    <div className="text-sm text-[#787774] mt-1">
                      ขอเปลี่ยนวันคืนเป็น: <span className="font-medium text-[#37352f]">{fmt(r.newDueDate)}</span>
                    </div>
                  )}
                  {r.type === 'schedule' && (
                    <div className="flex items-center gap-1 text-sm text-[#787774] mt-1">
                      <CalendarClock size={13} /> {fmt(r.startDate)} – {fmt(r.endDate)}
                    </div>
                  )}

                  {r.note && <div className="text-sm text-[#787774] mt-1">หมายเหตุ: {r.note}</div>}
                  {r.rejectedReason && (
                    <div className="text-sm text-[#e03e3e] mt-1">เหตุผล: {r.rejectedReason}</div>
                  )}
                  <div className="text-xs text-[#aeacaa] mt-2">
                    {new Date(r.createdAt).toLocaleString('th-TH')}
                  </div>
                </div>

                <div className="flex flex-col gap-1 min-w-[120px]">
                  {canApprove && (
                    <>
                      <button onClick={() => approve(r._id)} disabled={busyId === r._id}
                        className="inline-flex items-center gap-1 bg-[#0f7b6c] text-white text-sm px-3 py-1.5 rounded-md hover:bg-[#0d6b5e] disabled:opacity-50">
                        <CheckCircle2 size={14} /> อนุมัติ
                      </button>
                      <button onClick={() => reject(r._id)} disabled={busyId === r._id}
                        className="inline-flex items-center gap-1 border border-[#e9e9e7] text-[#e03e3e] text-sm px-3 py-1.5 rounded-md hover:bg-red-50 disabled:opacity-50">
                        <XCircle size={14} /> ปฏิเสธ
                      </button>
                    </>
                  )}
                  {canCancel && !canApprove && (
                    <button onClick={() => cancel(r._id)} disabled={busyId === r._id}
                      className="text-sm text-[#787774] hover:text-[#e03e3e] px-3 py-1">
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
