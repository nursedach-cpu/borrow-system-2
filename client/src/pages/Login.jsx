import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-2">ระบบยืม-คืนอุปกรณ์</h2>
          <p className="text-center text-sm text-gray-400 mb-6">Equipment Borrowing System</p>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
          <label className="block mb-4">
            <span className="text-sm text-gray-700">อีเมล / Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2" required />
          </label>
          <label className="block mb-6">
            <span className="text-sm text-gray-700">รหัสผ่าน / Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2" required />
          </label>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            เข้าสู่ระบบ / Login
          </button>
          <p className="text-center text-sm mt-4 text-gray-500">
            ยังไม่มีบัญชี? <Link to="/register" className="text-blue-600 hover:underline">สมัครสมาชิก / Register</Link>
          </p>
        </form>

        <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full px-6 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center justify-between"
          >
            <span>คู่มือการใช้งาน / User Guide</span>
            <span className="text-lg">{showGuide ? '▲' : '▼'}</span>
          </button>
          {showGuide && (
            <div className="px-6 pb-5 border-t">
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
