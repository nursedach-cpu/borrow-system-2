import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DEPARTMENTS } from '../constants/departments';

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
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0f7b6c] rounded-xl text-white text-xl mb-3">
            ✨
          </div>
          <h2 className="text-2xl font-bold text-[#37352f]">สร้างบัญชีใหม่</h2>
          <p className="text-sm text-[#787774] mt-1">สมัครเพื่อเริ่มใช้งานระบบ</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[#e9e9e7] p-7 rounded-lg">
          {error && (
            <div className="bg-red-50 border border-red-100 text-[#e03e3e] p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          <label className="block mb-3">
            <span className="text-xs font-medium text-[#787774] uppercase tracking-wider">ชื่อ *</span>
            <input name="name" value={form.name} onChange={onChange} className="notion-input mt-1.5" required />
          </label>
          <label className="block mb-3">
            <span className="text-xs font-medium text-[#787774] uppercase tracking-wider">อีเมล *</span>
            <input name="email" type="email" value={form.email} onChange={onChange} className="notion-input mt-1.5" required />
          </label>
          <label className="block mb-3">
            <span className="text-xs font-medium text-[#787774] uppercase tracking-wider">รหัสผ่าน *</span>
            <input name="password" type="password" value={form.password} onChange={onChange} className="notion-input mt-1.5" required />
          </label>
          <label className="block mb-3">
            <span className="text-xs font-medium text-[#787774] uppercase tracking-wider">แผนก</span>
            <select name="department" value={form.department} onChange={onChange} className="notion-input mt-1.5">
              <option value="">— ไม่สังกัด (คนนอก) —</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
              ))}
            </select>
          </label>
          <label className="block mb-5">
            <span className="text-xs font-medium text-[#787774] uppercase tracking-wider">เบอร์โทร</span>
            <input name="phone" value={form.phone} onChange={onChange} className="notion-input mt-1.5" />
          </label>
          <button type="submit" className="w-full btn-primary justify-center py-2.5">
            สมัครสมาชิก
          </button>
          <p className="text-center text-sm mt-4 text-[#787774]">
            มีบัญชีแล้ว?{' '}
            <Link to="/login" className="text-[#2383e2] hover:underline font-medium">เข้าสู่ระบบ</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
