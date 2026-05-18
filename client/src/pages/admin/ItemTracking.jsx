import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function ItemTracking() {
  const [items, setItems] = useState([]);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    const res = await api.get('/items?status=borrowed');
    setItems(res.data);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">ติดตามอุปกรณ์</h2>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">อุปกรณ์</th>
              <th className="text-left px-4 py-3">หมวดหมู่</th>
              <th className="text-left px-4 py-3">ผู้ยืม</th>
              <th className="text-left px-4 py-3">ยืมตั้งแต่</th>
              <th className="text-left px-4 py-3">กำหนดคืน</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3">{item.category || '-'}</td>
                <td className="px-4 py-3">{item.currentBorrow?.borrower?.name || '-'}</td>
                <td className="px-4 py-3">
                  {item.currentBorrow?.borrowDate
                    ? new Date(item.currentBorrow.borrowDate).toLocaleDateString('th-TH') : '-'}
                </td>
                <td className="px-4 py-3">
                  {item.currentBorrow?.dueDate
                    ? new Date(item.currentBorrow.dueDate).toLocaleDateString('th-TH') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="text-center py-8 text-gray-400">ไม่มีอุปกรณ์ที่ถูกยืมอยู่</div>}
      </div>
    </div>
  );
}
