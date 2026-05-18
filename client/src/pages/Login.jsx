import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/borrower');
    } catch (err) {
      setError(err.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">เข้าสู่ระบบ</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <label className="block mb-4">
          <span className="text-sm text-gray-700">อีเมล</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2" required />
        </label>
        <label className="block mb-6">
          <span className="text-sm text-gray-700">รหัสผ่าน</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2" required />
        </label>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          เข้าสู่ระบบ
        </button>
        <p className="text-center text-sm mt-4 text-gray-500">
          ยังไม่มีบัญชี? <Link to="/register" className="text-blue-600 hover:underline">สมัครสมาชิก</Link>
        </p>
      </form>
    </div>
  );
}
