import { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  MapPin, Search, Package, CheckCircle, Clock, Wrench,
  AlertTriangle, User, Building2, RefreshCw,
} from 'lucide-react';
import { DEPARTMENTS } from '../../constants/departments';

// Whole-day difference between a past date and now (>= 0).
function daysSince(date) {
  if (!date) return null;
  const ms = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

function fmt(d) {
  return d ? new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
}

const STATUS = {
  available: { th: 'ว่าง', cls: 'bg-green-50 text-[#0f7b6c]', icon: CheckCircle },
  borrowed: { th: 'ถูกยืม', cls: 'bg-orange-50 text-[#d9730d]', icon: Clock },
  maintenance: { th: 'ซ่อมบำรุง', cls: 'bg-[#f3f0ea] text-[#6c6770]', icon: Wrench },
};

export default function ItemTracking() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
    /* eslint-disable-next-line */
  }, [deptFilter]);

  async function load() {
    try {
      const params = {};
      if (deptFilter) params.dept = deptFilter;
      const res = await api.get('/items', { params });
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  }

  const isOverdue = (it) =>
    it.currentBorrow?.dueDate && new Date(it.currentBorrow.dueDate) < new Date();

  // Summary counts (over the dept-filtered set).
  const summary = {
    total: items.length,
    available: items.filter((i) => i.status === 'available').length,
    borrowed: items.filter((i) => i.status === 'borrowed').length,
    overdue: items.filter(isOverdue).length,
  };

  const filtered = items.filter((it) => {
    if (statusFilter && it.status !== statusFilter) return false;
    if (search.trim()) {
      const t = search.toLowerCase();
      const hay = [
        it.name, it.category, it.ownerDepartment,
        it.currentBorrow?.borrower?.name,
        it.currentBorrow?.borrower?.department,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(t)) return false;
    }
    return true;
  });

  const summaryCards = [
    { label: 'ทั้งหมด', value: summary.total, cls: 'text-[#221f26]', bg: 'bg-[#f3f0ea]', icon: Package },
    { label: 'ว่าง', value: summary.available, cls: 'text-[#0f7b6c]', bg: 'bg-green-50', icon: CheckCircle },
    { label: 'ถูกยืม', value: summary.borrowed, cls: 'text-[#d9730d]', bg: 'bg-orange-50', icon: Clock },
    { label: 'เกินกำหนด', value: summary.overdue, cls: 'text-[#c33b32]', bg: 'bg-red-50', icon: AlertTriangle },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#221f26] mb-1">ติดตามเครื่องมือ</h1>
          <p className="text-sm text-[#6c6770]">เครื่องมือแต่ละชิ้นอยู่ที่ไหน ใครถืออยู่ และนานแค่ไหน (อัปเดตอัตโนมัติทุก 30 วิ)</p>
        </div>
        <button onClick={load} className="btn-secondary" title="รีเฟรช">
          <RefreshCw size={14} /> รีเฟรช
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="notion-card">
              <div className={`w-8 h-8 rounded-md ${c.bg} flex items-center justify-center mb-2`}>
                <Icon size={15} className={c.cls} />
              </div>
              <div className={`text-2xl font-bold tabular-nums ${c.cls}`}>{c.value}</div>
              <div className="text-xs text-[#6c6770]">{c.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6770]" />
          <input
            placeholder="ค้นหา (ชื่อเครื่องมือ, ผู้ถือ, แผนก)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="notion-input pl-9"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="notion-input max-w-[160px]">
          <option value="">ทุกสถานะ</option>
          <option value="available">ว่าง</option>
          <option value="borrowed">ถูกยืม</option>
          <option value="maintenance">ซ่อมบำรุง</option>
        </select>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="notion-input max-w-[200px]">
          <option value="">ทุกแผนก</option>
          <option value="general">ของส่วนกลาง</option>
          {DEPARTMENTS.map((d) => (
            <option key={d.code} value={d.code}>{d.code}</option>
          ))}
        </select>
      </div>

      {loading && <div className="text-[#6c6770] text-sm">กำลังโหลด...</div>}

      {/* Tracking table */}
      <div className="bg-white border border-[#e6e1da] rounded-lg overflow-hidden">
        <table className="notion-table">
          <thead>
            <tr>
              <th>เครื่องมือ</th>
              <th>เจ้าของ</th>
              <th>สถานะ</th>
              <th>ผู้ถือปัจจุบัน</th>
              <th>ยืมตั้งแต่</th>
              <th>กำหนดคืน</th>
              <th>ถือมาแล้ว</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => {
              const st = STATUS[it.status] || STATUS.available;
              const StIcon = st.icon;
              const overdue = isOverdue(it);
              const held = daysSince(it.currentBorrow?.borrowDate);
              return (
                <tr key={it._id} className={overdue ? 'bg-red-50/40' : ''}>
                  <td>
                    <div className="flex items-center gap-3">
                      {it.imageUrl ? (
                        <img src={it.imageUrl} className="w-9 h-9 rounded object-cover border border-[#e6e1da]" alt="" />
                      ) : (
                        <div className="w-9 h-9 rounded bg-[#f3f0ea] border border-[#e6e1da] flex items-center justify-center">
                          <Package size={16} className="text-[#6c6770]" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-[#221f26]">{it.name}</div>
                        {it.category && <div className="text-xs text-[#9d97a0]">{it.category}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    {it.ownerDepartment ? (
                      <span className="badge bg-violet-50 text-[#6a2c8f]"><Building2 size={11} /> {it.ownerDepartment}</span>
                    ) : (
                      <span className="badge bg-[#f3f0ea] text-[#6c6770]">ส่วนกลาง</span>
                    )}
                  </td>
                  <td><span className={`badge ${st.cls}`}><StIcon size={11} /> {st.th}</span></td>
                  <td>
                    {it.currentBorrow?.borrower ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#0f7b6c] text-white text-[10px] font-semibold flex items-center justify-center">
                          {it.currentBorrow.borrower.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-[#221f26]">{it.currentBorrow.borrower.name}</div>
                          {it.currentBorrow.borrower.department && (
                            <div className="text-xs text-[#9d97a0]">{it.currentBorrow.borrower.department}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[#9d97a0]">—</span>
                    )}
                  </td>
                  <td className="text-[#6c6770]">{fmt(it.currentBorrow?.borrowDate)}</td>
                  <td>
                    {it.currentBorrow?.dueDate ? (
                      <span className={overdue ? 'text-[#c33b32] font-medium flex items-center gap-1' : 'text-[#6c6770]'}>
                        {overdue && <AlertTriangle size={12} />}
                        {fmt(it.currentBorrow.dueDate)}
                      </span>
                    ) : <span className="text-[#9d97a0]">-</span>}
                  </td>
                  <td>
                    {held !== null && it.status === 'borrowed' ? (
                      <span className={overdue ? 'text-[#c33b32] font-medium' : 'text-[#6c6770]'}>
                        {held} วัน
                      </span>
                    ) : <span className="text-[#9d97a0]">-</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-[#6c6770]">
            <MapPin size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm">ไม่พบเครื่องมือ</div>
          </div>
        )}
      </div>
    </div>
  );
}
