import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DEPARTMENTS } from '../constants/departments';
import Brandmark from '../components/Brandmark';

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
    <div className="min-h-screen flex items-center justify-center bg-[#f6f4f1] p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <Brandmark size={46} />
          <h2 className="text-[22px] font-bold text-[var(--ink)] mt-3">สร้างบัญชีใหม่</h2>
          <p className="text-[13px] text-[var(--ink-faint)] mt-0.5">สมัครเพื่อเริ่มใช้งานระบบ</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[var(--line)] p-7 rounded-xl shadow-[0_1px_3px_rgba(34,31,38,0.06)]">
          {error && (
            <div className="bg-red-50 border border-red-100 text-[#c33b32] p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          <label className="block mb-3">
            <span className="text-xs font-medium text-[#6c6770] uppercase tracking-wider">ชื่อ *</span>
            <input name="name" value={form.name} onChange={onChange} className="notion-input mt-1.5" required />
          </label>
          <label className="block mb-3">
            <span className="text-xs font-medium text-[#6c6770] uppercase tracking-wider">อีเมล *</span>
            <input name="email" type="email" value={form.email} onChange={onChange} className="notion-input mt-1.5" required />
          </label>
          <label className="block mb-3">
            <span className="text-xs font-medium text-[#6c6770] uppercase tracking-wider">รหัสผ่าน *</span>
            <input name="password" type="password" value={form.password} onChange={onChange} className="notion-input mt-1.5" required />
          </label>
          <label className="block mb-3">
            <span className="text-xs font-medium text-[#6c6770] uppercase tracking-wider">แผนก</span>
            <select name="department" value={form.department} onChange={onChange} className="notion-input mt-1.5">
              <option value="">— ไม่สังกัด (คนนอก) —</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
              ))}
            </select>
          </label>
          <label className="block mb-5">
            <span className="text-xs font-medium text-[#6c6770] uppercase tracking-wider">เบอร์โทร</span>
            <input name="phone" value={form.phone} onChange={onChange} className="notion-input mt-1.5" />
          </label>
          <button type="submit" className="w-full btn-primary justify-center py-2.5">
            สมัครสมาชิก
          </button>
          <p className="text-center text-sm mt-4 text-[#6c6770]">
            มีบัญชีแล้ว?{' '}
            <Link to="/login" className="text-[#6a2c8f] hover:underline font-medium">เข้าสู่ระบบ</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
