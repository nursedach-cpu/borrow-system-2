import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Plus, Pencil, Trash2, QrCode, Upload, Package } from 'lucide-react';

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
  const statusStyle = {
    available: 'bg-green-50 text-[#0f7b6c]',
    borrowed: 'bg-orange-50 text-[#d9730d]',
    maintenance: 'bg-gray-100 text-[#787774]',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#37352f] mb-1">จัดการอุปกรณ์</h1>
          <p className="text-sm text-[#787774]">เพิ่ม แก้ไข ลบอุปกรณ์ และจัดการ QR Code</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditItem(null); setForm({ name: '', description: '', category: '' }); }}
          className="btn-primary"
        >
          <Plus size={16} />
          เพิ่มอุปกรณ์
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="notion-card mb-5">
          <h3 className="font-semibold text-[#37352f] mb-4">{editItem ? 'แก้ไข' : 'เพิ่ม'}อุปกรณ์</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input name="name" placeholder="ชื่อ *" value={form.name} onChange={onChange}
              className="notion-input" required />
            <input name="category" placeholder="หมวดหมู่" value={form.category} onChange={onChange}
              className="notion-input" />
            <input name="description" placeholder="รายละเอียด" value={form.description} onChange={onChange}
              className="notion-input" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">บันทึก</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">ยกเลิก</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-[#e9e9e7] rounded-lg overflow-hidden">
        <table className="notion-table">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>หมวดหมู่</th>
              <th>สถานะ</th>
              <th>QR Code</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="w-9 h-9 rounded object-cover border border-[#e9e9e7]" />
                    ) : (
                      <div className="w-9 h-9 rounded bg-[#f7f6f3] border border-[#e9e9e7] flex items-center justify-center">
                        <Package size={16} className="text-[#787774]" />
                      </div>
                    )}
                    <span className="font-medium text-[#37352f]">{item.name}</span>
                  </div>
                </td>
                <td className="text-[#787774]">{item.category || '-'}</td>
                <td>
                  <span className={`badge ${statusStyle[item.status]}`}>{statusLabel[item.status]}</span>
                </td>
                <td>
                  <button onClick={() => downloadQr(item._id, item.name)}
                    className="inline-flex items-center gap-1 text-[#2383e2] hover:bg-blue-50 px-2 py-1 rounded text-xs">
                    <QrCode size={13} /> ดาวน์โหลด
                  </button>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(item)}
                      className="inline-flex items-center gap-1 text-[#37352f] hover:bg-[#f7f6f3] px-2 py-1 rounded text-xs">
                      <Pencil size={13} /> แก้ไข
                    </button>
                    <label className="inline-flex items-center gap-1 text-[#0f7b6c] hover:bg-green-50 px-2 py-1 rounded text-xs cursor-pointer">
                      <Upload size={13} /> อัปโหลดรูป
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { if (e.target.files[0]) handleImageUpload(item._id, e.target.files[0]); }} />
                    </label>
                    <button onClick={() => handleDelete(item._id)}
                      className="inline-flex items-center gap-1 text-[#e03e3e] hover:bg-red-50 px-2 py-1 rounded text-xs">
                      <Trash2 size={13} /> ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-center py-12 text-[#787774]">
            <Package size={32} className="mx-auto mb-2 opacity-40" />
            <div className="text-sm">ยังไม่มีอุปกรณ์</div>
          </div>
        )}
      </div>
    </div>
  );
}
