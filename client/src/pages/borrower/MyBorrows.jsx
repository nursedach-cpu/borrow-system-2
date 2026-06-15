import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function MyBorrows() {
  const [borrows, setBorrows] = useState([]);
  const [extendingId, setExtendingId] = useState('');
  const [newDate, setNewDate] = useState('');
  const [extendNote, setExtendNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [weightInfo, setWeightInfo] = useState(null);

  useEffect(() => { loadBorrows(); loadWeight(); }, []);

  async function loadBorrows() {
    const res = await api.get('/borrows/my');
    setBorrows(res.data.filter((r) => r.status === 'approved'));
  }

  async function loadWeight() {
    try {
      const res = await api.get('/users/me/weight');
      setWeightInfo(res.data);
    } catch {
      // weight info is non-critical
    }
  }

  function openExtend(record) {
    setExtendingId(record._id);
    setNewDate('');
    setExtendNote('');
  }

  function cancelExtend() {
    setExtendingId('');
    setNewDate('');
    setExtendNote('');
  }

  async function submitExtend() {
    if (!newDate) {
      alert('กรุณาเลือกวันคืนใหม่');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/reservations/extension', {
        borrowRecordId: extendingId,
        newDueDate: newDate,
        note: extendNote || undefined,
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
      <h2 className="text-xl font-bold mb-4">ของที่ยืมอยู่</h2>

      {weightInfo && (
        <div className="bg-white rounded shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-1 text-sm font-medium text-gray-700">
            <span>น้ำหนักที่ยืมอยู่</span>
            <span className={weightInfo.currentWeight >= weightInfo.weightLimit ? 'text-red-600' : 'text-gray-600'}>
              {weightInfo.currentWeight.toFixed(2)} / {weightInfo.weightLimit} kg
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                weightInfo.currentWeight >= weightInfo.weightLimit ? 'bg-red-500' :
                weightInfo.currentWeight / weightInfo.weightLimit > 0.8 ? 'bg-yellow-400' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((weightInfo.currentWeight / weightInfo.weightLimit) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {borrows.map((r) => {
          const overdue = r.dueDate && new Date(r.dueDate) < new Date();
          const isExtending = extendingId === r._id;
          return (
            <div key={r._id} className="bg-white rounded shadow p-4">
              <div className="font-medium">{r.item?.name || '-'}</div>
              <div className="text-sm text-gray-500">
                ยืมตั้งแต่: {new Date(r.borrowDate).toLocaleDateString('th-TH')}
              </div>
              {r.dueDate && (
                <div className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                  กำหนดคืน: {new Date(r.dueDate).toLocaleDateString('th-TH')}
                  {overdue && ' (เกินกำหนด!)'}
                </div>
              )}

              {!isExtending ? (
                <button
                  onClick={() => openExtend(r)}
                  className="mt-3 text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded hover:bg-amber-200"
                >
                  ขอขยายเวลา
                </button>
              ) : (
                <div className="mt-3 border-t pt-3">
                  <label className="block text-sm text-gray-700 mb-1">วันคืนใหม่</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={r.dueDate ? new Date(r.dueDate).toISOString().slice(0, 10) : ''}
                    className="border rounded px-3 py-2 w-full mb-2"
                  />
                  <label className="block text-sm text-gray-700 mb-1">เหตุผล (ไม่บังคับ)</label>
                  <input
                    value={extendNote}
                    onChange={(e) => setExtendNote(e.target.value)}
                    placeholder="เช่น ต้องใช้งานต่ออีกสัปดาห์"
                    className="border rounded px-3 py-2 w-full mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitExtend}
                      disabled={submitting}
                      className="bg-amber-600 text-white text-sm px-3 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
                    >
                      {submitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                    </button>
                    <button
                      onClick={cancelExtend}
                      className="text-sm text-gray-600 px-3 py-2"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {borrows.length === 0 && <div className="text-gray-400 text-center py-8">ไม่มีของที่ยืมอยู่</div>}
      </div>
    </div>
  );
}
