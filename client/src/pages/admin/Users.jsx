import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState({});
  const [editingWeight, setEditingWeight] = useState({});

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    const res = await api.get('/users');
    setUsers(res.data);
  }

  async function saveWeightLimit(user) {
    const val = editingWeight[user._id];
    if (val === undefined || val === '') return;
    const num = Number(val);
    if (isNaN(num) || num < 0) { alert('ค่าไม่ถูกต้อง'); return; }
    setUpdating((prev) => ({ ...prev, [`w_${user._id}`]: true }));
    try {
      await api.put(`/users/${user._id}/weight-limit`, { weightLimit: num });
      loadUsers();
      setEditingWeight((prev) => { const n = { ...prev }; delete n[user._id]; return n; });
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setUpdating((prev) => ({ ...prev, [`w_${user._id}`]: false }));
    }
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

  const roleLabel = { admin: 'ผู้ดูแล', borrower: 'ผู้ยืม' };
  const roleBadge = {
    admin: 'bg-blue-100 text-blue-700',
    borrower: 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">จัดการผู้ใช้</h2>
      <input
        placeholder="ค้นหา (ชื่อ, อีเมล, แผนก)..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-full max-w-md"
      />
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">ชื่อ</th>
              <th className="text-left px-4 py-3">อีเมล</th>
              <th className="text-left px-4 py-3">แผนก</th>
              <th className="text-left px-4 py-3">สิทธิ์</th>
              <th className="text-left px-4 py-3">จำกัดน้ำหนัก (kg)</th>
              <th className="text-left px-4 py-3">สมัครเมื่อ</th>
              <th className="text-left px-4 py-3">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.department || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${roleBadge[u.role]}`}>
                    {roleLabel[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {editingWeight[u._id] !== undefined ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="border rounded px-2 py-1 w-20 text-sm"
                        value={editingWeight[u._id]}
                        onChange={(e) => setEditingWeight((prev) => ({ ...prev, [u._id]: e.target.value }))}
                      />
                      <button
                        onClick={() => saveWeightLimit(u)}
                        disabled={updating[`w_${u._id}`]}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50"
                      >บันทึก</button>
                      <button
                        onClick={() => setEditingWeight((prev) => { const n = { ...prev }; delete n[u._id]; return n; })}
                        className="text-xs text-gray-500 px-1"
                      >✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingWeight((prev) => ({ ...prev, [u._id]: String(u.weightLimit ?? 10) }))}
                      className="text-sm text-gray-700 hover:text-blue-600 underline-offset-2 hover:underline"
                    >
                      {u.weightLimit ?? 10} kg
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  {new Date(u.createdAt).toLocaleDateString('th-TH')}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRole(u)}
                    disabled={updating[u._id]}
                    className={`text-xs px-3 py-1 rounded ${
                      u.role === 'admin'
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    } disabled:opacity-50`}
                  >
                    {updating[u._id]
                      ? 'กำลังเปลี่ยน...'
                      : u.role === 'admin'
                        ? 'ลดเป็นผู้ยืม'
                        : 'เลื่อนเป็นผู้ดูแล'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400">ไม่พบผู้ใช้</div>
        )}
      </div>
    </div>
  );
}
