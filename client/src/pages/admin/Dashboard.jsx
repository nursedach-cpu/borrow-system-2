import { useState, useEffect } from 'react';
import api from '../../api/client';
import ItemBorrowStats from '../../components/ItemBorrowStats';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      setError('โหลดข้อมูลไม่สำเร็จ');
    }
  }

  if (error) return <div className="text-red-600">{error}</div>;
  if (!stats) return <div>กำลังโหลด...</div>;

  const cards = [
    { label: 'อุปกรณ์ทั้งหมด', value: stats.totalItems, color: 'bg-blue-500' },
    { label: 'ว่าง', value: stats.available, color: 'bg-green-500' },
    { label: 'ถูกยืม', value: stats.borrowed, color: 'bg-yellow-500' },
    { label: 'ซ่อมบำรุง', value: stats.maintenance, color: 'bg-gray-500' },
    { label: 'คำขอรออนุมัติ', value: stats.pendingRequests, color: 'bg-orange-500' },
    { label: 'เกินกำหนดคืน', value: stats.overdueItems, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">แดชบอร์ด</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-4">
            <div className={`text-3xl font-bold ${card.color.replace('bg-', 'text-')}`}>
              {card.value}
            </div>
            <div className="text-sm text-gray-600 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <ItemBorrowStats />
    </div>
  );
}
