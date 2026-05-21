import { useState, useEffect } from 'react';
import api from '../../api/client';

const TYPE_LABEL = {
  queue: { th: 'จองคิว', en: 'Queue', color: 'bg-purple-100 text-purple-700' },
  extension: { th: 'ขอขยายเวลา', en: 'Extension', color: 'bg-amber-100 text-amber-700' },
  schedule: { th: 'จองล่วงหน้า', en: 'Schedule', color: 'bg-sky-100 text-sky-700' },
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

  if (loading) return <div className="text-gray-400">กำลังโหลด...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">การจองของฉัน</h2>

      {list.length === 0 && (
        <div className="text-gray-400 text-center py-8">ยังไม่มีการจอง</div>
      )}

      <div className="space-y-3">
        {list.map((r) => {
          const type = TYPE_LABEL[r.type];
          const status = STATUS_LABEL[r.status];
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

                  {r.type === 'queue' && r.queuePosition && r.status === 'approved' && (
                    <div className="text-sm text-purple-700 mt-1">
                      คุณอยู่คิวที่ <span className="font-bold">{r.queuePosition}</span>
                    </div>
                  )}
                  {r.type === 'queue' && r.status === 'fulfilled' && (
                    <div className="text-sm text-blue-700 mt-1 font-medium">
                      🎉 ถึงคิวคุณแล้ว! ไปสแกน QR เพื่อยืมได้เลย
                    </div>
                  )}

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
                    จองเมื่อ: {new Date(r.createdAt).toLocaleString('th-TH')}
                  </div>
                </div>

                {canCancel && (
                  <button
                    onClick={() => cancel(r._id)}
                    className="text-sm text-red-600 hover:text-red-800 px-2 py-1"
                  >
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
