import { useState, useEffect } from 'react';
import api from '../../api/client';
import { MapPin } from 'lucide-react';

export default function ItemTracking() {
  const [items, setItems] = useState([]);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    const res = await api.get('/items?status=borrowed');
    setItems(res.data);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#37352f] mb-1">ติดตามอุปกรณ์</h1>
        <p className="text-sm text-[#787774]">รายการอุปกรณ์ที่ถูกยืมอยู่ในขณะนี้</p>
      </div>

      <div className="bg-white border border-[#e9e9e7] rounded-lg overflow-hidden">
        <table className="notion-table">
          <thead>
            <tr>
              <th>อุปกรณ์</th>
              <th>หมวดหมู่</th>
              <th>ผู้ยืม</th>
              <th>ยืมตั้งแต่</th>
              <th>กำหนดคืน</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td className="font-medium text-[#37352f]">{item.name}</td>
                <td className="text-[#787774]">{item.category || '-'}</td>
                <td className="text-[#787774]">{item.currentBorrow?.borrower?.name || '-'}</td>
                <td className="text-[#787774]">
                  {item.currentBorrow?.borrowDate ? new Date(item.currentBorrow.borrowDate).toLocaleDateString('th-TH') : '-'}
                </td>
                <td className="text-[#787774]">
                  {item.currentBorrow?.dueDate ? new Date(item.currentBorrow.dueDate).toLocaleDateString('th-TH') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-center py-12 text-[#787774]">
            <MapPin size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm">ไม่มีอุปกรณ์ที่ถูกยืมอยู่</div>
          </div>
        )}
      </div>
    </div>
  );
}
