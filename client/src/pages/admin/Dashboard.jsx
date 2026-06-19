import { useState, useEffect } from 'react';
import api from '../../api/client';
import ItemBorrowStats from '../../components/ItemBorrowStats';
import { Package, CheckCircle, Clock, Wrench, AlertCircle, AlarmClock } from 'lucide-react';

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

  if (error) return <div className="text-[#c33b32] text-sm">{error}</div>;
  if (!stats) return <div className="text-[#6c6770] text-sm">กำลังโหลด...</div>;

  const cards = [
    { label: 'อุปกรณ์ทั้งหมด', value: stats.totalItems, icon: Package, color: 'text-[#6a2c8f]', bg: 'bg-violet-50' },
    { label: 'ว่าง', value: stats.available, icon: CheckCircle, color: 'text-[#0f7b6c]', bg: 'bg-green-50' },
    { label: 'ถูกยืม', value: stats.borrowed, icon: Clock, color: 'text-[#d9730d]', bg: 'bg-orange-50' },
    { label: 'ซ่อมบำรุง', value: stats.maintenance, icon: Wrench, color: 'text-[#6c6770]', bg: 'bg-gray-100' },
    { label: 'คำขอรออนุมัติ', value: stats.pendingRequests, icon: AlertCircle, color: 'text-[#cb6a00]', bg: 'bg-yellow-50' },
    { label: 'เกินกำหนดคืน', value: stats.overdueItems, icon: AlarmClock, color: 'text-[#c33b32]', bg: 'bg-red-50' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#221f26] mb-1">แดชบอร์ด</h1>
        <p className="text-sm text-[#6c6770]">ภาพรวมระบบยืม-คืนอุปกรณ์</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="notion-card hover:border-[#cfc8bd] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon size={18} className={card.color} />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#221f26] tabular-nums">{card.value}</div>
              <div className="text-sm text-[#6c6770] mt-1">{card.label}</div>
            </div>
          );
        })}
      </div>

      <ItemBorrowStats />
    </div>
  );
}
