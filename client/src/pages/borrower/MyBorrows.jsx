import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Boxes, Calendar, AlertTriangle, Clock } from 'lucide-react';

export default function MyBorrows() {
  const [borrows, setBorrows] = useState([]);
  const [extendingId, setExtendingId] = useState('');
  const [newDate, setNewDate] = useState('');
  const [extendNote, setExtendNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadBorrows(); }, []);

  async function loadBorrows() {
    const res = await api.get('/borrows/my');
    setBorrows(res.data.filter((r) => r.status === 'approved'));
  }

  function openExtend(record) {
    setExtendingId(record._id); setNewDate(''); setExtendNote('');
  }

  function cancelExtend() {
    setExtendingId(''); setNewDate(''); setExtendNote('');
  }

  async function submitExtend() {
    if (!newDate) { alert('กรุณาเลือกวันคืนใหม่'); return; }
    setSubmitting(true);
    try {
      await api.post('/reservations/extension', {
        borrowRecordId: extendingId, newDueDate: newDate, note: extendNote || undefined,
      });
      alert('ส่งคำขอขยายเวลาแล้ว รออนุมัติจาก Admin');
      cancelExtend();
      await loadBorrows();
    } catch (err) {
      alert(err.response?.data?.error || 'ส่งคำขอไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#37352f] mb-1">ของที่ยืมอยู่</h1>
        <p className="text-sm text-[#787774]">รายการอุปกรณ์ที่คุณกำลังยืม</p>
      </div>

      <div className="space-y-2">
        {borrows.map((r) => {
          const overdue = r.dueDate && new Date(r.dueDate) < new Date();
          const isExtending = extendingId === r._id;
          return (
            <div key={r._id} className={`notion-card ${overdue ? 'border-l-4 border-l-[#e03e3e]' : ''}`}>
              <div className="font-semibold text-[#37352f]">{r.item?.name || '-'}</div>
              <div className="flex items-center gap-1 text-sm text-[#787774] mt-1">
                <Calendar size={13} /> ยืม: {new Date(r.borrowDate).toLocaleDateString('th-TH')}
              </div>
              {r.dueDate && (
                <div className={`flex items-center gap-1 text-sm mt-1 ${overdue ? 'text-[#e03e3e] font-medium' : 'text-[#787774]'}`}>
                  {overdue ? <AlertTriangle size={13} /> : <Clock size={13} />}
                  กำหนดคืน: {new Date(r.dueDate).toLocaleDateString('th-TH')}
                  {overdue && ' (เกินกำหนด!)'}
                </div>
              )}

              {!isExtending ? (
                <button onClick={() => openExtend(r)}
                  className="mt-3 inline-flex items-center gap-1 bg-amber-50 text-[#d9730d] px-3 py-1.5 rounded-md text-sm hover:bg-amber-100">
                  <Clock size={13} /> ขอขยายเวลา
                </button>
              ) : (
                <div className="mt-3 pt-3 border-t border-[#e9e9e7] space-y-3">
                  <label className="block">
                    <span className="text-xs font-medium text-[#787774] uppercase tracking-wider">วันคืนใหม่</span>
                    <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                      min={r.dueDate ? new Date(r.dueDate).toISOString().slice(0, 10) : ''}
                      className="notion-input mt-1" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-[#787774] uppercase tracking-wider">เหตุผล (ไม่บังคับ)</span>
                    <input value={extendNote} onChange={(e) => setExtendNote(e.target.value)}
                      placeholder="เช่น ต้องใช้งานต่ออีกสัปดาห์" className="notion-input mt-1" />
                  </label>
                  <div className="flex gap-2">
                    <button onClick={submitExtend} disabled={submitting}
                      className="inline-flex items-center gap-1 bg-[#d9730d] text-white px-3 py-1.5 rounded-md text-sm hover:bg-[#b85d09] disabled:opacity-50">
                      {submitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                    </button>
                    <button onClick={cancelExtend} className="btn-secondary">ยกเลิก</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {borrows.length === 0 && (
          <div className="text-center py-12 text-[#787774]">
            <Boxes size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm">ไม่มีของที่ยืมอยู่</div>
          </div>
        )}
      </div>
    </div>
  );
}
