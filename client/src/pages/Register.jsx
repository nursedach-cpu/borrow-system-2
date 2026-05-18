import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', phone: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/borrower');
    } catch (err) {
      setError(err.response?.data?.error || 'สมัครสมาชิกไม่สำเร็จ');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">สมัครสมาชิก</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <label className="block mb-3">
          <span className="text-sm text-gray-700">ชื่อ *</span>
          <input name="name" value={form.name} onChange={onChange}
            className="mt-1 block w-full border rounded px-3 py-2" required />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-gray-700">อีเมล *</span>
          <input name="email" type="email" value={form.email} onChange={onChange}
            className="mt-1 block w-full border rounded px-3 py-2" required />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-gray-700">รหัสผ่าน *</span>
          <input name="password" type="password" value={form.password} onChange={onChange}
            className="mt-1 block w-full border rounded px-3 py-2" required />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-gray-700">แผนก</span>
          <input name="department" value={form.department} onChange={onChange}
            className="mt-1 block w-full border rounded px-3 py-2" />
        </label>
        <label className="block mb-6">
          <span className="text-sm text-gray-700">เบอร์โทร</span>
          <input name="phone" value={form.phone} onChange={onChange}
            className="mt-1 block w-full border rounded px-3 py-2" />
        </label>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          สมัครสมาชิก
        </button>
        <p className="text-center text-sm mt-4 text-gray-500">
          มีบัญชีแล้ว? <Link to="/login" className="text-blue-600 hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </div>
  );
}
