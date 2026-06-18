import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Bug, Save, Trash2, Settings2, Inbox } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'open', label: 'ใหม่', cls: 'bg-blue-50 text-[#2383e2]' },
  { value: 'in_progress', label: 'กำลังตรวจสอบ', cls: 'bg-yellow-50 text-[#cb6a00]' },
  { value: 'resolved', label: 'แก้ไขแล้ว', cls: 'bg-green-50 text-[#0f7b6c]' },
  { value: 'closed', label: 'ปิด', cls: 'bg-[#f7f6f3] text-[#787774]' },
  { value: 'wont_fix', label: 'ไม่แก้ไข', cls: 'bg-[#f7f6f3] text-[#787774]' },
];

const SEVERITY_LABEL = {
  low: { th: 'น้อย', cls: 'bg-[#f7f6f3] text-[#787774]' },
  medium: { th: 'ปานกลาง', cls: 'bg-yellow-50 text-[#cb6a00]' },
  high: { th: 'มาก', cls: 'bg-orange-50 text-[#d9730d]' },
  critical: { th: 'วิกฤติ', cls: 'bg-red-50 text-[#e03e3e]' },
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
      await api.put(`/bug-reports/${editingId}/status`, { status: editStatus, adminNote: editNote });
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#37352f] mb-1">จัดการรายงานบั๊ก</h1>
        <p className="text-sm text-[#787774]">รายงานบั๊กและข้อเสนอแนะจากผู้ใช้</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'ใหม่', value: stats.open, cls: 'text-[#2383e2]', bg: 'bg-blue-50' },
            { label: 'กำลังตรวจ', value: stats.inProgress, cls: 'text-[#cb6a00]', bg: 'bg-yellow-50' },
            { label: 'แก้แล้ว', value: stats.resolved, cls: 'text-[#0f7b6c]', bg: 'bg-green-50' },
            { label: 'ปิด', value: stats.closed, cls: 'text-[#787774]', bg: 'bg-[#f7f6f3]' },
            { label: 'วิกฤติค้าง', value: stats.criticalUnresolved, cls: 'text-[#e03e3e]', bg: 'bg-red-50' },
          ].map((s) => (
            <div key={s.label} className="notion-card">
              <div className={`w-8 h-8 rounded-md ${s.bg} flex items-center justify-center mb-2`}>
                <Bug size={14} className={s.cls} />
              </div>
              <div className={`text-2xl font-bold ${s.cls} tabular-nums`}>{s.value}</div>
              <div className="text-xs text-[#787774]">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="notion-input max-w-[180px]">
          <option value="">ทุกสถานะ</option>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="notion-input max-w-[180px]">
          <option value="">ทุกความรุนแรง</option>
          <option value="critical">วิกฤติ</option>
          <option value="high">มาก</option>
          <option value="medium">ปานกลาง</option>
          <option value="low">น้อย</option>
        </select>
      </div>

      {loading && <div className="text-[#787774] text-sm">กำลังโหลด...</div>}
      {!loading && list.length === 0 && (
        <div className="text-center py-12 text-[#787774] notion-card">
          <Inbox size={32} className="mx-auto mb-2 opacity-40" />
          <div className="text-sm">ไม่มีรายงาน</div>
        </div>
      )}

      <div className="space-y-2">
        {list.map((r) => {
          const status = statusInfo(r.status);
          const sev = SEVERITY_LABEL[r.severity];
          const isEditing = editingId === r._id;
          return (
            <div key={r._id} className="notion-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`badge ${status.cls}`}>{status.label}</span>
                    <span className={`badge ${sev.cls}`}>{sev.th}</span>
                    <span className="badge bg-[#f7f6f3] text-[#787774]">{CATEGORY_LABEL[r.category]}</span>
                  </div>
                  <div className="font-semibold text-[#37352f]">{r.title}</div>
                  <div className="text-sm text-[#787774] mt-1">
                    โดย: <span className="font-medium text-[#37352f]">{r.reporter?.name || '-'}</span>
                    {r.reporter?.department && <span className="text-[#aeacaa]"> · {r.reporter.department}</span>}
                  </div>
                  <div className="text-sm text-[#37352f] mt-2 whitespace-pre-wrap">{r.description}</div>

                  {r.screenshotUrl && (
                    <a href={r.screenshotUrl} target="_blank" rel="noreferrer">
                      <img src={r.screenshotUrl} className="mt-2 max-h-40 rounded border border-[#e9e9e7]" alt="" />
                    </a>
                  )}

                  {r.adminNote && !isEditing && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-[#2383e2]">
                      💬 <span className="font-medium">Note:</span> {r.adminNote}
                    </div>
                  )}

                  <div className="text-xs text-[#aeacaa] mt-2">
                    {new Date(r.createdAt).toLocaleString('th-TH')}
                    {r.pageUrl && <span> · <code className="bg-[#f7f6f3] px-1 rounded">{r.pageUrl}</code></span>}
                  </div>
                  {r.userAgent && <div className="text-xs text-[#aeacaa] truncate">UA: {r.userAgent}</div>}
                </div>

                <div className="flex flex-col gap-1 min-w-[100px]">
                  {!isEditing && (
                    <>
                      <button onClick={() => openEdit(r)} className="btn-primary">
                        <Settings2 size={14} /> จัดการ
                      </button>
                      <button onClick={() => del(r._id)} className="btn-danger">
                        <Trash2 size={14} /> ลบ
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-3 p-3 bg-[#f7f6f3] rounded space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-[#787774] uppercase tracking-wider mb-1">เปลี่ยนสถานะ</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="notion-input">
                      {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#787774] uppercase tracking-wider mb-1">โน้ตถึงผู้แจ้ง (ไม่บังคับ)</label>
                    <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} rows={2}
                      placeholder="เช่น แก้ไขใน v1.2 แล้ว / ขอบคุณสำหรับข้อเสนอ"
                      className="notion-input" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId('')} className="btn-secondary">ยกเลิก</button>
                    <button onClick={saveEdit} className="btn-primary"><Save size={14} /> บันทึก</button>
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
