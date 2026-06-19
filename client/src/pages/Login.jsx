import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Brandmark from '../components/Brandmark';

function UserGuide({ lang, onToggleLang }) {
  if (lang === 'th') {
    return (
      <div className="text-left text-sm text-gray-600 leading-relaxed">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-800">คู่มือการใช้งาน</h3>
          <button onClick={onToggleLang} className="text-xs text-blue-600 hover:underline">English</button>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-blue-700 mb-1">สำหรับผู้ยืม (Borrower)</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>สมัครสมาชิก</strong> — กดปุ่ม "สมัครสมาชิก" กรอกชื่อ อีเมล รหัสผ่าน</li>
            <li><strong>เข้าสู่ระบบ</strong> — ใส่อีเมลและรหัสผ่านที่สมัครไว้</li>
            <li><strong>สแกน QR Code</strong> — ใช้กล้องสแกน QR ที่ติดอยู่บนอุปกรณ์ หรือพิมพ์รหัส QR</li>
            <li><strong>ขอยืม</strong> — กำหนดวันคืน แนบรูปถ่าย แล้วกด "ขอยืม"</li>
            <li><strong>รอการอนุมัติ</strong> — ดูสถานะได้ที่เมนู "สถานะคำขอ"</li>
            <li><strong>ดูประวัติ</strong> — ดูรายการยืม-คืนทั้งหมดที่เมนู "ประวัติของฉัน"</li>
          </ol>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-green-700 mb-1">สำหรับผู้ดูแลระบบ (Admin)</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>แดชบอร์ด</strong> — ดูภาพรวมจำนวนอุปกรณ์ สถานะการยืม</li>
            <li><strong>จัดการอุปกรณ์</strong> — เพิ่ม แก้ไข ลบอุปกรณ์ และสร้าง QR Code</li>
            <li><strong>อนุมัติคำขอ</strong> — อนุมัติหรือปฏิเสธคำขอยืมจากผู้ใช้</li>
            <li><strong>รับคืน</strong> — แนบรูปคืน และกดยืนยันรับคืนอุปกรณ์</li>
            <li><strong>ประวัติ</strong> — ดูประวัติยืม-คืนทั้งหมด พร้อมรูปถ่ายประกอบ</li>
            <li><strong>ติดตามอุปกรณ์</strong> — ดูว่าใครยืมอะไรอยู่ กำหนดคืนเมื่อไหร่</li>
            <li><strong>จัดการผู้ใช้</strong> — เลื่อนสิทธิ์ผู้ใช้เป็นผู้ดูแล หรือลดกลับเป็นผู้ยืม</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
          <strong>หมายเหตุ:</strong> ผู้ดูแลคนแรกจะถูกสร้างโดยระบบ หากต้องการเพิ่มผู้ดูแล ให้ผู้ดูแลที่มีอยู่เข้าไปเลื่อนสิทธิ์ในหน้า "จัดการผู้ใช้"
        </div>
      </div>
    );
  }

  return (
    <div className="text-left text-sm text-gray-600 leading-relaxed">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-800">User Guide</h3>
        <button onClick={onToggleLang} className="text-xs text-blue-600 hover:underline">ภาษาไทย</button>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-blue-700 mb-1">For Borrowers</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li><strong>Register</strong> — Click "Register" and fill in your name, email, and password</li>
          <li><strong>Login</strong> — Enter your registered email and password</li>
          <li><strong>Scan QR Code</strong> — Use your camera to scan the QR code on the equipment, or type the code manually</li>
          <li><strong>Request to Borrow</strong> — Set a due date, attach a photo, and click "Borrow"</li>
          <li><strong>Wait for Approval</strong> — Check your request status in "Request Status" menu</li>
          <li><strong>View History</strong> — See all your borrow/return records in "My History"</li>
        </ol>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-green-700 mb-1">For Administrators</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li><strong>Dashboard</strong> — Overview of equipment count and borrow status</li>
          <li><strong>Manage Items</strong> — Add, edit, delete equipment and generate QR codes</li>
          <li><strong>Approve Requests</strong> — Approve or reject borrow requests from users</li>
          <li><strong>Confirm Returns</strong> — Attach return photo and confirm equipment return</li>
          <li><strong>History</strong> — View all borrow/return records with photos</li>
          <li><strong>Track Items</strong> — See who is borrowing what and when it's due</li>
          <li><strong>Manage Users</strong> — Promote users to admin or demote back to borrower</li>
        </ol>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
        <strong>Note:</strong> The first admin account is created by the system. To add more admins, an existing admin can promote users in the "Manage Users" page.
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [guideLang, setGuideLang] = useState('th');
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
    <div className="min-h-screen flex items-center justify-center bg-[#f6f4f1] p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <Brandmark size={46} />
          <h2 className="text-[22px] font-bold text-[var(--ink)] mt-3">ระบบยืม-คืนอุปกรณ์</h2>
          <p className="text-[13px] text-[var(--ink-faint)] mt-0.5">เครื่องมือและอุปกรณ์ · การไฟฟ้า</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-[var(--line)] p-7 rounded-xl shadow-[0_1px_3px_rgba(34,31,38,0.06)]">
          {error && (
            <div className="bg-red-50 border border-red-100 text-[#c33b32] p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          <label className="block mb-4">
            <span className="text-xs font-medium text-[#6c6770] uppercase tracking-wider">อีเมล / Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="notion-input mt-1.5"
              required
            />
          </label>
          <label className="block mb-5">
            <span className="text-xs font-medium text-[#6c6770] uppercase tracking-wider">รหัสผ่าน / Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="notion-input mt-1.5"
              required
            />
          </label>
          <button type="submit" className="w-full btn-primary justify-center py-2.5">
            เข้าสู่ระบบ / Login
          </button>
          <p className="text-center text-sm mt-4 text-[#6c6770]">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="text-[#6a2c8f] hover:underline font-medium">
              สมัครสมาชิก / Register
            </Link>
          </p>
        </form>

        <div className="mt-4 bg-white border border-[#e6e1da] rounded-lg overflow-hidden">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full px-5 py-3 text-sm font-medium text-[#221f26] hover:bg-[#f3f0ea] flex items-center justify-between transition-colors"
          >
            <span>📖 คู่มือการใช้งาน / User Guide</span>
            <span className="text-xs text-[#6c6770]">{showGuide ? '▲' : '▼'}</span>
          </button>
          {showGuide && (
            <div className="px-5 pb-5 border-t border-[#e6e1da]">
              <div className="mt-4">
                <UserGuide lang={guideLang} onToggleLang={() => setGuideLang(guideLang === 'th' ? 'en' : 'th')} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
