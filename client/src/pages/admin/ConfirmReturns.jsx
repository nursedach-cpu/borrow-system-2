import { useState, useEffect } from 'react';
import api from '../../api/client';

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
      <h2 className="text-xl font-bold mb-4">รับคืนอุปกรณ์</h2>
      <div className="space-y-3">
        {borrows.map((r) => (
          <div key={r._id} className={`bg-white rounded shadow p-4 ${
            isOverdue(r.dueDate) ? 'border-l-4 border-red-500' : ''
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{r.item?.name || 'ไม่ทราบ'}</div>
                <div className="text-sm text-gray-500">ผู้ยืม: {r.borrower?.name}</div>
                <div className="text-sm text-gray-500">
                  ยืมตั้งแต่: {new Date(r.borrowDate).toLocaleDateString('th-TH')}
                </div>
                {r.dueDate && (
                  <div className={`text-sm ${isOverdue(r.dueDate) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    กำหนดคืน: {new Date(r.dueDate).toLocaleDateString('th-TH')}
                    {isOverdue(r.dueDate) && ' (เกินกำหนด!)'}
                  </div>
                )}
                {r.borrowImage && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-400">รูปตอนยืม:</span>
                    <img src={r.borrowImage} className="w-24 h-16 object-cover rounded mt-1 border" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <label className="text-xs text-gray-500 cursor-pointer">
                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 hover:bg-gray-200">
                    แนบรูปคืน
                  </span>
                  <input type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={(e) => handlePhotoChange(r._id, e)} />
                </label>
                {photoPreviews[r._id] && (
                  <img src={photoPreviews[r._id]} className="w-20 h-14 object-cover rounded border" />
                )}
                <button onClick={() => confirmReturn(r._id)} disabled={submitting[r._id]}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                  {submitting[r._id] ? 'กำลังบันทึก...' : 'ยืนยันรับคืน'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {borrows.length === 0 && <div className="text-gray-400 text-center py-8">ไม่มีอุปกรณ์ที่ถูกยืมอยู่</div>}
      </div>
    </div>
  );
}
