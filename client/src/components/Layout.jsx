import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BugReportButton from './BugReportButton';
import Brandmark from './Brandmark';
import {
  LayoutDashboard, Package, CheckCircle2, RotateCcw, CalendarClock,
  History, MapPin, Users, Bug, QrCode, Boxes, BookmarkCheck,
  ClipboardList, Clock, LogOut, ShieldCheck, User, Menu, X,
} from 'lucide-react';

// Nav is grouped into sections — the way a person organizes an internal tool,
// not a flat dump of every route.
const adminGroups = [
  {
    title: 'ภาพรวม',
    links: [
      { to: '/admin', label: 'แดชบอร์ด', icon: LayoutDashboard },
      { to: '/admin/tracking', label: 'ติดตามเครื่องมือ', icon: MapPin },
    ],
  },
  {
    title: 'คำขอ',
    links: [
      { to: '/admin/approve', label: 'อนุมัติคำขอ', icon: CheckCircle2 },
      { to: '/admin/returns', label: 'รับคืน', icon: RotateCcw },
      { to: '/admin/reservations', label: 'จัดการการจอง', icon: CalendarClock },
    ],
  },
  {
    title: 'คลัง',
    links: [
      { to: '/admin/items', label: 'จัดการอุปกรณ์', icon: Package },
      { to: '/admin/history', label: 'ประวัติ', icon: History },
    ],
  },
  {
    title: 'ระบบ',
    links: [
      { to: '/admin/users', label: 'จัดการผู้ใช้', icon: Users },
      { to: '/admin/bug-reports', label: 'รายงานบั๊ก', icon: Bug },
    ],
  },
];

const borrowerGroups = [
  {
    title: 'ยืม-คืน',
    links: [
      { to: '/borrower', label: 'สแกน QR', icon: QrCode },
      { to: '/borrower/my-borrows', label: 'ของที่ยืมอยู่', icon: Boxes },
      { to: '/borrower/reservations', label: 'การจองของฉัน', icon: BookmarkCheck },
    ],
  },
  {
    title: 'ของฉัน',
    links: [
      { to: '/borrower/requests', label: 'สถานะคำขอ', icon: ClipboardList },
      { to: '/borrower/history', label: 'ประวัติ', icon: Clock },
      { to: '/borrower/bug-reports', label: 'บั๊กที่ฉันแจ้ง', icon: Bug },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user.role === 'admin';
  const groups = isAdmin ? adminGroups : borrowerGroups;
  const [open, setOpen] = useState(false); // mobile drawer

  const roleLine = isAdmin
    ? (user.department ? `ผู้ดูแล · ${user.department}` : 'ผู้ดูแลระบบ')
    : (user.department ? `${user.department}` : 'บุคคลภายนอก');

  return (
    <div className="min-h-screen flex bg-white">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-[var(--paper)] border-b border-[var(--line)] flex items-center gap-2 px-3">
        <button onClick={() => setOpen(true)} className="p-2 -ml-1 rounded hover:bg-[var(--surface-2)]" aria-label="เมนู">
          <Menu size={22} className="text-[var(--ink)]" />
        </button>
        <Brandmark size={26} />
        <span className="text-[15px] font-bold text-[var(--ink)]">ระบบยืม-คืน</span>
      </header>

      {/* Backdrop (mobile only, when drawer open) */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar — static on desktop, slide-in drawer on mobile */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[248px] bg-[var(--paper)] border-r border-[var(--line)]
          flex flex-col transform transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Brand lockup + mobile close */}
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <Brandmark size={30} />
          <div className="leading-tight flex-1">
            <div className="text-[14px] font-bold text-[var(--ink)]">ระบบยืม-คืน</div>
            <div className="text-[10.5px] text-[var(--ink-faint)] tracking-wide">เครื่องมือ · การไฟฟ้า</div>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden p-1.5 rounded hover:bg-[var(--surface-2)]" aria-label="ปิดเมนู">
            <X size={18} className="text-[var(--ink-soft)]" />
          </button>
        </div>

        <div className="h-px bg-[var(--line)] mx-3" />

        {/* Grouped nav */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.title} className="mb-3">
              <p className="px-2.5 mb-1 text-[10.5px] font-semibold text-[var(--ink-faint)] uppercase tracking-[0.08em]">
                {group.title}
              </p>
              {group.links.map((link) => {
                const Icon = link.icon;
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`nav-link ${active ? 'nav-link-active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-[var(--line)] p-2.5">
          <div className="flex items-center gap-2.5 px-1.5 py-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${isAdmin ? 'bg-[var(--brand)]' : 'bg-[var(--good)]'}`}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[var(--ink)] truncate">{user.name}</div>
              <div className="text-[11px] text-[var(--ink-faint)] flex items-center gap-1 truncate">
                {isAdmin ? <ShieldCheck size={10} /> : <User size={10} />}
                {roleLine}
              </div>
            </div>
            <button onClick={logout} title="ออกจากระบบ"
              className="text-[var(--ink-faint)] hover:text-[var(--stop)] p-1.5 rounded hover:bg-[var(--stop-tint)] transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-white pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-9">
          <Outlet />
        </div>
      </main>
      <BugReportButton />
    </div>
  );
}
