import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function MyBorrows() {
  const [borrows, setBorrows] = useState([]);

  useEffect(() => { loadBorrows(); }, []);

  async function loadBorrows() {
    const res = await api.get('/borrows/my');
    setBorrows(res.data.filter((r) => r.status === 'approved'));
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">ของที่ยืมอยู่</h2>
      <div className="space-y-3">
        {borrows.map((r) => (
          <div key={r._id} className="bg-white rounded shadow p-4">
            <div className="font-medium">{r.item?.name || '-'}</div>
            <div className="text-sm text-gray-500">
              ยืมตั้งแต่: {new Date(r.borrowDate).toLocaleDateString('th-TH')}
            </div>
            {r.dueDate && (
              <div className={`text-sm ${new Date(r.dueDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                กำหนดคืน: {new Date(r.dueDate).toLocaleDateString('th-TH')}
                {new Date(r.dueDate) < new Date() && ' (เกินกำหนด!)'}
              </div>
            )}
          </div>
        ))}
        {borrows.length === 0 && <div className="text-gray-400 text-center py-8">ไม่มีของที่ยืมอยู่</div>}
      </div>
    </div>
  );
}
