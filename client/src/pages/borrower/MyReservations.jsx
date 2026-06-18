import { useState, useEffect } from 'react';
import api from '../../api/client';
import { BookmarkCheck, CalendarClock, PartyPopper } from 'lucide-react';

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

export default function MyReservations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/reservations/my');
      setList(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function cancel(id) {
    if (!window.confirm('ยกเลิกการจองนี้?')) return;
    try {
      await api.delete(`/reservations/${id}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'ยกเลิกไม่สำเร็จ');
    }
  }

  if (loading) return <div className="text-[#787774] text-sm">กำลังโหลด...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#37352f] mb-1">การจองของฉัน</h1>
        <p className="text-sm text-[#787774]">รายการจองคิว ขยายเวลา และจองล่วงหน้า</p>
      </div>

      {list.length === 0 && (
        <div className="text-center py-12 text-[#787774]">
          <BookmarkCheck size={32} className="mx-auto mb-2 opacity-40" />
          <div className="text-sm">ยังไม่มีการจอง</div>
        </div>
      )}

      <div className="space-y-2">
        {list.map((r) => {
          const type = TYPE_LABEL[r.type];
          const status = STATUS_LABEL[r.status];
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

                  {r.type === 'queue' && r.queuePosition && r.status === 'approved' && (
                    <div className="text-sm text-[#7c3aed] mt-1">
                      คุณอยู่คิวที่ <span className="font-bold">{r.queuePosition}</span>
                    </div>
                  )}
                  {r.type === 'queue' && r.status === 'fulfilled' && (
                    <div className="text-sm text-[#2383e2] mt-1 font-medium flex items-center gap-1">
                      <PartyPopper size={14} /> ถึงคิวคุณแล้ว! ไปสแกน QR เพื่อยืมได้เลย
                    </div>
                  )}

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
                    จองเมื่อ: {new Date(r.createdAt).toLocaleString('th-TH')}
                  </div>
                </div>

                {canCancel && (
                  <button onClick={() => cancel(r._id)} className="text-sm text-[#e03e3e] hover:bg-red-50 px-2 py-1 rounded">
                    ยกเลิก
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
