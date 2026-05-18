import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function ConfirmReturns() {
  const [borrows, setBorrows] = useState([]);

  useEffect(() => { loadBorrows(); }, []);

  async function loadBorrows() {
    const res = await api.get('/borrows?status=approved');
    setBorrows(res.data);
  }

  async function confirmReturn(id) {
    await api.put(`/borrows/${id}/return`);
    loadBorrows();
  }

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">รับคืนอุปกรณ์</h2>
      <div className="space-y-3">
        {borrows.map((r) => (
          <div key={r._id} className={`bg-white rounded shadow p-4 flex justify-between items-center ${
            isOverdue(r.dueDate) ? 'border-l-4 border-red-500' : ''
          }`}>
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
            </div>
            <button onClick={() => confirmReturn(r._id)}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
              ยืนยันรับคืน
            </button>
          </div>
        ))}
        {borrows.length === 0 && <div className="text-gray-400 text-center py-8">ไม่มีอุปกรณ์ที่ถูกยืมอยู่</div>}
      </div>
    </div>
  );
}
