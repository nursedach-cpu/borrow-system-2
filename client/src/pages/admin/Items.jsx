import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Items() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', category: '' });

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    const res = await api.get('/items');
    setItems(res.data);
  }

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editItem) {
      await api.put(`/items/${editItem._id}`, form);
    } else {
      await api.post('/items', form);
    }
    setShowForm(false);
    setEditItem(null);
    setForm({ name: '', description: '', category: '' });
    loadItems();
  }

  function startEdit(item) {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', category: item.category || '' });
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm('ต้องการลบรายการนี้?')) return;
    try {
      await api.delete(`/items/${id}`);
      loadItems();
    } catch (err) {
      alert(err.response?.data?.error || 'ลบไม่สำเร็จ');
    }
  }

  async function handleImageUpload(id, file) {
    const formData = new FormData();
    formData.append('image', file);
    await api.post(`/items/${id}/image`, formData);
    loadItems();
  }

  function downloadQr(id, name) {
    const token = localStorage.getItem('token');
    fetch(`/api/items/${id}/qr`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `qr-${name}.png`;
        link.click();
      });
  }

  const statusLabel = { available: 'ว่าง', borrowed: 'ถูกยืม', maintenance: 'ซ่อมบำรุง' };
  const statusColor = { available: 'text-green-600', borrowed: 'text-yellow-600', maintenance: 'text-gray-600' };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">จัดการอุปกรณ์</h2>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm({ name: '', description: '', category: '' }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
          + เพิ่มอุปกรณ์
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
          <h3 className="font-medium mb-3">{editItem ? 'แก้ไข' : 'เพิ่ม'}อุปกรณ์</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input name="name" placeholder="ชื่อ *" value={form.name} onChange={onChange}
              className="border rounded px-3 py-2" required />
            <input name="category" placeholder="หมวดหมู่" value={form.category} onChange={onChange}
              className="border rounded px-3 py-2" />
            <input name="description" placeholder="รายละเอียด" value={form.description} onChange={onChange}
              className="border rounded px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">บันทึก</button>
            <button type="button" onClick={() => setShowForm(false)}
              className="bg-gray-200 px-4 py-2 rounded text-sm">ยกเลิก</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">ชื่อ</th>
              <th className="text-left px-4 py-3">หมวดหมู่</th>
              <th className="text-left px-4 py-3">สถานะ</th>
              <th className="text-left px-4 py-3">QR Code</th>
              <th className="text-left px-4 py-3">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {item.imageUrl && <img src={item.imageUrl} className="w-8 h-8 rounded object-cover" />}
                    {item.name}
                  </div>
                </td>
                <td className="px-4 py-3">{item.category || '-'}</td>
                <td className={`px-4 py-3 font-medium ${statusColor[item.status]}`}>
                  {statusLabel[item.status]}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => downloadQr(item._id, item.name)}
                    className="text-blue-600 hover:underline text-xs">ดาวน์โหลด QR</button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(item)} className="text-blue-600 hover:underline text-xs">แก้ไข</button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:underline text-xs">ลบ</button>
                    <label className="text-green-600 hover:underline text-xs cursor-pointer">
                      อัปโหลดรูป
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { if (e.target.files[0]) handleImageUpload(item._id, e.target.files[0]); }} />
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="text-center py-8 text-gray-400">ยังไม่มีอุปกรณ์</div>}
      </div>
    </div>
  );
}
