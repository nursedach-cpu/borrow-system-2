import { useState, useEffect } from 'react';
import api from '../../api/client';

const STATUS_OPTIONS = [
  { value: 'open', label: 'ใหม่', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_progress', label: 'กำลังตรวจสอบ', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resolved', label: 'แก้ไขแล้ว', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'ปิด', color: 'bg-gray-100 text-gray-600' },
  { value: 'wont_fix', label: 'ไม่แก้ไข', color: 'bg-gray-100 text-gray-600' },
];

const SEVERITY_LABEL = {
  low: { th: 'น้อย', color: 'bg-gray-100 text-gray-700' },
  medium: { th: 'ปานกลาง', color: 'bg-yellow-100 text-yellow-800' },
  high: { th: 'มาก', color: 'bg-orange-100 text-orange-800' },
  critical: { th: 'วิกฤติ', color: 'bg-red-100 text-red-700' },
};

const CATEGORY_LABEL = {
  ui: 'UI', functionality: 'ฟังก์ชัน', performance: 'ประสิทธิภาพ',
  data: 'ข้อมูล', suggestion: 'ข้อเสนอแนะ', other: 'อื่นๆ',
};

function statusInfo(s) {
  return STATUS_OPTIONS.find((o) => o.value === s) || STATUS_OPTIONS[0];
}

export default function AdminBugReports() {
  const [list, setList] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statusFilter, severityFilter]);
  useEffect(() => { loadStats(); }, []);

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      const res = await api.get('/bug-reports', { params });
      setList(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await api.get('/bug-reports/stats');
      setStats(res.data);
    } catch (err) { /* non-critical */ }
  }

  function openEdit(report) {
    setEditingId(report._id);
    setEditStatus(report.status);
    setEditNote(report.adminNote || '');
  }

  async function saveEdit() {
    try {
      await api.put(`/bug-reports/${editingId}/status`, {
        status: editStatus,
        adminNote: editNote,
      });
      setEditingId('');
      await load();
      await loadStats();
    } catch (err) {
      alert(err.response?.data?.error || 'บันทึกไม่สำเร็จ');
    }
  }

  async function del(id) {
    if (!window.confirm('ลบรายงานนี้?')) return;
    try {
      await api.delete(`/bug-reports/${id}`);
      await load();
      await loadStats();
    } catch (err) {
      alert(err.response?.data?.error || 'ลบไม่สำเร็จ');
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">จัดการรายงานบั๊ก</h2>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-blue-50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.open}</div>
            <div className="text-xs text-gray-600">ใหม่</div>
          </div>
          <div className="bg-yellow-50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-yellow-700">{stats.inProgress}</div>
            <div className="text-xs text-gray-600">กำลังตรวจ</div>
          </div>
          <div className="bg-green-50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.resolved}</div>
            <div className="text-xs text-gray-600">แก้แล้ว</div>
          </div>
          <div className="bg-gray-50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-gray-700">{stats.closed}</div>
            <div className="text-xs text-gray-600">ปิด</div>
          </div>
          <div className="bg-red-50 rounded p-3 text-center">
            <div className="text-2xl font-bold text-red-700">{stats.criticalUnresolved}</div>
            <div className="text-xs text-gray-600">วิกฤติค้าง</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm">
          <option value="">ทุกสถานะ</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm">
          <option value="">ทุกความรุนแรง</option>
          <option value="critical">วิกฤติ</option>
          <option value="high">มาก</option>
          <option value="medium">ปานกลาง</option>
          <option value="low">น้อย</option>
        </select>
      </div>

      {loading && <div className="text-gray-400">กำลังโหลด...</div>}
      {!loading && list.length === 0 && (
        <div className="text-gray-400 text-center py-8 bg-white rounded shadow">ไม่มีรายงาน</div>
      )}

      <div className="space-y-3">
        {list.map((r) => {
          const status = statusInfo(r.status);
          const sev = SEVERITY_LABEL[r.severity];
          const isEditing = editingId === r._id;
          return (
            <div key={r._id} className="bg-white rounded shadow p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>{status.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${sev.color}`}>{sev.th}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {CATEGORY_LABEL[r.category]}
                    </span>
                  </div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    โดย: <span className="font-medium">{r.reporter?.name || '-'}</span>
                    {r.reporter?.department && <span className="text-gray-400"> · {r.reporter.department}</span>}
                  </div>
                  <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{r.description}</div>

                  {r.screenshotUrl && (
                    <a href={r.screenshotUrl} target="_blank" rel="noreferrer">
                      <img src={r.screenshotUrl} className="mt-2 max-h-40 rounded border" alt="" />
                    </a>
                  )}

                  {r.adminNote && !isEditing && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-900">
                      💬 <span className="font-medium">Note:</span> {r.adminNote}
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(r.createdAt).toLocaleString('th-TH')}
                    {r.pageUrl && <span> · <code>{r.pageUrl}</code></span>}
                  </div>
                  {r.userAgent && (
                    <div className="text-xs text-gray-400 truncate">UA: {r.userAgent}</div>
                  )}
                </div>

                <div className="flex flex-col gap-1 min-w-[100px]">
                  {!isEditing && (
                    <>
                      <button onClick={() => openEdit(r)}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                        จัดการ
                      </button>
                      <button onClick={() => del(r._id)}
                        className="text-sm text-red-600 hover:text-red-800 px-3 py-1">
                        ลบ
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-3 p-3 bg-gray-50 rounded space-y-2">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">เปลี่ยนสถานะ</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                      className="border rounded px-3 py-2 w-full">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">โน้ตถึงผู้แจ้ง (ไม่บังคับ)</label>
                    <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)}
                      rows={2}
                      placeholder="เช่น แก้ไขใน v1.2 แล้ว / ขอบคุณสำหรับข้อเสนอ"
                      className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId('')}
                      className="text-sm text-gray-600 px-3 py-1">ยกเลิก</button>
                    <button onClick={saveEdit}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                      บันทึก
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
