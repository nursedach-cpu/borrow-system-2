import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Camera, CheckCircle2, AlertTriangle, Inbox, Calendar, User } from 'lucide-react';

export default function ConfirmReturns() {
  const [borrows, setBorrows] = useState([]);
  const [returnPhotos, setReturnPhotos] = useState({});
  const [photoPreviews, setPhotoPreviews] = useState({});
  const [submitting, setSubmitting] = useState({});

  useEffect(() => { loadBorrows(); }, []);

  async function loadBorrows() {
    const res = await api.get('/borrows?status=approved');
    setBorrows(res.data);
  }

  function handlePhotoChange(id, e) {
    const file = e.target.files[0];
    if (file) {
      setReturnPhotos((prev) => ({ ...prev, [id]: file }));
      setPhotoPreviews((prev) => ({ ...prev, [id]: URL.createObjectURL(file) }));
    }
  }

  async function confirmReturn(id) {
    setSubmitting((prev) => ({ ...prev, [id]: true }));
    try {
      if (returnPhotos[id]) {
        const formData = new FormData();
        formData.append('image', returnPhotos[id]);
        await api.post(`/borrows/${id}/return-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      await api.put(`/borrows/${id}/return`);
      loadBorrows();
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setSubmitting((prev) => ({ ...prev, [id]: false }));
    }
  }

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#37352f] mb-1">รับคืนอุปกรณ์</h1>
        <p className="text-sm text-[#787774]">รายการอุปกรณ์ที่ถูกยืมอยู่ พร้อมรับคืน</p>
      </div>

      <div className="space-y-2">
        {borrows.map((r) => (
          <div key={r._id} className={`notion-card ${isOverdue(r.dueDate) ? 'border-l-4 border-l-[#e03e3e]' : ''}`}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="font-semibold text-[#37352f] mb-1">{r.item?.name || 'ไม่ทราบ'}</div>
                <div className="flex items-center gap-1 text-sm text-[#787774]">
                  <User size={13} /> ผู้ยืม: {r.borrower?.name}
                </div>
                <div className="flex items-center gap-1 text-sm text-[#787774] mt-1">
                  <Calendar size={13} /> ยืม: {new Date(r.borrowDate).toLocaleDateString('th-TH')}
                </div>
                {r.dueDate && (
                  <div className={`flex items-center gap-1 text-sm mt-1 ${isOverdue(r.dueDate) ? 'text-[#e03e3e] font-medium' : 'text-[#787774]'}`}>
                    {isOverdue(r.dueDate) ? <AlertTriangle size={13} /> : <Calendar size={13} />}
                    กำหนดคืน: {new Date(r.dueDate).toLocaleDateString('th-TH')}
                    {isOverdue(r.dueDate) && ' (เกินกำหนด!)'}
                  </div>
                )}
                {r.borrowImage && (
                  <div className="mt-2">
                    <span className="text-xs text-[#aeacaa]">รูปตอนยืม:</span>
                    <img src={r.borrowImage} className="w-24 h-16 object-cover rounded mt-1 border border-[#e9e9e7]" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <label className="btn-secondary cursor-pointer">
                  <Camera size={14} /> แนบรูปคืน
                  <input type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={(e) => handlePhotoChange(r._id, e)} />
                </label>
                {photoPreviews[r._id] && (
                  <img src={photoPreviews[r._id]} className="w-20 h-14 object-cover rounded border border-[#e9e9e7]" />
                )}
                <button onClick={() => confirmReturn(r._id)} disabled={submitting[r._id]}
                  className="btn-primary">
                  <CheckCircle2 size={14} />
                  {submitting[r._id] ? 'กำลังบันทึก...' : 'ยืนยันรับคืน'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {borrows.length === 0 && (
          <div className="text-center py-12 text-[#787774]">
            <Inbox size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm">ไม่มีอุปกรณ์ที่ถูกยืมอยู่</div>
          </div>
        )}
      </div>
    </div>
  );
}
