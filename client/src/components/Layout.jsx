import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'แดชบอร์ด' },
  { to: '/admin/items', label: 'จัดการอุปกรณ์' },
  { to: '/admin/approve', label: 'อนุมัติคำขอ' },
  { to: '/admin/returns', label: 'รับคืน' },
  { to: '/admin/history', label: 'ประวัติ' },
  { to: '/admin/tracking', label: 'ติดตามอุปกรณ์' },
];

const borrowerLinks = [
  { to: '/borrower', label: 'สแกน QR' },
  { to: '/borrower/my-borrows', label: 'ของที่ยืมอยู่' },
  { to: '/borrower/history', label: 'ประวัติของฉัน' },
  { to: '/borrower/requests', label: 'สถานะคำขอ' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const links = user.role === 'admin' ? adminLinks : borrowerLinks;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-blue-600">ระบบยืม-คืน</h1>
          <p className="text-sm text-gray-500 mt-1">{user.name}</p>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            {user.role === 'admin' ? 'ผู้ดูแล' : 'ผู้ยืม'}
          </span>
        </div>
        <nav className="flex-1 p-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-2 rounded mb-1 text-sm ${
                location.pathname === link.to
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full text-sm text-red-600 hover:text-red-800"
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
