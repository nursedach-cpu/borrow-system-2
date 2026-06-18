import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Search, ShieldCheck, User, UserPlus, UserMinus } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState({});

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    const res = await api.get('/users');
    setUsers(res.data);
  }

  async function toggleRole(user) {
    const newRole = user.role === 'admin' ? 'borrower' : 'admin';
    const confirm = window.confirm(
      `เปลี่ยนสิทธิ์ "${user.name}" จาก ${user.role === 'admin' ? 'ผู้ดูแล' : 'ผู้ยืม'} เป็น ${newRole === 'admin' ? 'ผู้ดูแล' : 'ผู้ยืม'}?`
    );
    if (!confirm) return;

    setUpdating((prev) => ({ ...prev, [user._id]: true }));
    try {
      await api.put(`/users/${user._id}/role`, { role: newRole });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setUpdating((prev) => ({ ...prev, [user._id]: false }));
    }
  }

  const filtered = users.filter((u) => {
    if (!filter) return true;
    const text = filter.toLowerCase();
    return (
      u.name?.toLowerCase().includes(text) ||
      u.email?.toLowerCase().includes(text) ||
      u.department?.toLowerCase().includes(text)
    );
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#37352f] mb-1">จัดการผู้ใช้</h1>
        <p className="text-sm text-[#787774]">ดูและจัดการสิทธิ์ของผู้ใช้ทั้งหมด</p>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#787774]" />
        <input
          placeholder="ค้นหา (ชื่อ, อีเมล, แผนก)..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="notion-input pl-9"
        />
      </div>

      <div className="bg-white border border-[#e9e9e7] rounded-lg overflow-hidden">
        <table className="notion-table">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>อีเมล</th>
              <th>แผนก</th>
              <th>สิทธิ์</th>
              <th>สมัครเมื่อ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded flex items-center justify-center text-white text-xs font-semibold ${u.role === 'admin' ? 'bg-[#2383e2]' : 'bg-[#0f7b6c]'}`}>
                      {u.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="font-medium text-[#37352f]">{u.name}</span>
                  </div>
                </td>
                <td className="text-[#787774]">{u.email}</td>
                <td className="text-[#787774]">{u.department || '-'}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'bg-blue-50 text-[#2383e2]' : 'bg-[#f7f6f3] text-[#787774]'}`}>
                    {u.role === 'admin' ? <><ShieldCheck size={11} /> ผู้ดูแล</> : <><User size={11} /> ผู้ยืม</>}
                  </span>
                </td>
                <td className="text-[#787774]">{new Date(u.createdAt).toLocaleDateString('th-TH')}</td>
                <td>
                  <button
                    onClick={() => toggleRole(u)}
                    disabled={updating[u._id]}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      u.role === 'admin' ? 'text-[#d9730d] hover:bg-orange-50' : 'text-[#2383e2] hover:bg-blue-50'
                    } disabled:opacity-50`}
                  >
                    {u.role === 'admin' ? <UserMinus size={13} /> : <UserPlus size={13} />}
                    {updating[u._id] ? 'กำลังเปลี่ยน...' : u.role === 'admin' ? 'ลดเป็นผู้ยืม' : 'เลื่อนเป็นผู้ดูแล'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#787774]">
            <User size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm">ไม่พบผู้ใช้</div>
          </div>
        )}
      </div>
    </div>
  );
}
