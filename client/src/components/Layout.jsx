import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BugReportButton from './BugReportButton';
import {
  LayoutDashboard,
  Package,
  CheckCircle2,
  RotateCcw,
  CalendarClock,
  History,
  MapPin,
  Users,
  Bug,
  QrCode,
  Boxes,
  BookmarkCheck,
  ClipboardList,
  Clock,
  LogOut,
  ShieldCheck,
  User,
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { to: '/admin/items', label: 'จัดการอุปกรณ์', icon: Package },
  { to: '/admin/approve', label: 'อนุมัติคำขอ', icon: CheckCircle2 },
  { to: '/admin/returns', label: 'รับคืน', icon: RotateCcw },
  { to: '/admin/reservations', label: 'จัดการการจอง', icon: CalendarClock },
  { to: '/admin/history', label: 'ประวัติ', icon: History },
  { to: '/admin/tracking', label: 'ติดตามอุปกรณ์', icon: MapPin },
  { to: '/admin/users', label: 'จัดการผู้ใช้', icon: Users },
  { to: '/admin/bug-reports', label: 'รายงานบั๊ก', icon: Bug },
];

const borrowerLinks = [
  { to: '/borrower', label: 'สแกน QR', icon: QrCode },
  { to: '/borrower/my-borrows', label: 'ของที่ยืมอยู่', icon: Boxes },
  { to: '/borrower/reservations', label: 'การจองของฉัน', icon: BookmarkCheck },
  { to: '/borrower/requests', label: 'สถานะคำขอ', icon: ClipboardList },
  { to: '/borrower/history', label: 'ประวัติของฉัน', icon: Clock },
  { to: '/borrower/bug-reports', label: 'บั๊กที่ฉันแจ้ง', icon: Bug },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const links = user.role === 'admin' ? adminLinks : borrowerLinks;
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen flex bg-white">
      <aside className="w-60 bg-[#fbfbfa] border-r border-[#e9e9e7] flex flex-col">
        {/* User block */}
        <div className="px-3 pt-4 pb-3">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#efefee] cursor-default">
            <div className={`w-7 h-7 rounded flex items-center justify-center text-white text-xs font-semibold ${isAdmin ? 'bg-[#2383e2]' : 'bg-[#0f7b6c]'}`}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#37352f] truncate">{user.name}</div>
              <div className="text-xs text-[#787774] flex items-center gap-1">
                {isAdmin ? <ShieldCheck size={11} /> : <User size={11} />}
                {isAdmin
                  ? (user.department ? `Admin ${user.department}` : 'Super Admin')
                  : (user.department ? `ผู้ยืม · ${user.department}` : 'ผู้ยืม (คนนอก)')}
              </div>
            </div>
          </div>
        </div>

        {/* Workspace label */}
        <div className="px-5 pt-2 pb-1">
          <p className="text-[11px] font-semibold text-[#787774] uppercase tracking-wider">
            ระบบยืม-คืน
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 pb-3 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${active ? 'nav-link-active' : ''}`}
              >
                <Icon size={16} className={active ? 'text-[#37352f]' : 'text-[#787774]'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-[#e9e9e7]">
          <button onClick={logout} className="nav-link w-full text-[#e03e3e] hover:bg-red-50">
            <LogOut size={16} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-white">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
      <BugReportButton />
    </div>
  );
}
