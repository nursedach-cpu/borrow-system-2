import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Bug, Trash2 } from 'lucide-react';

const STATUS_LABEL = {
  open: { th: 'ใหม่', cls: 'bg-blue-50 text-[#2383e2]' },
  in_progress: { th: 'กำลังตรวจสอบ', cls: 'bg-yellow-50 text-[#cb6a00]' },
  resolved: { th: 'แก้ไขแล้ว', cls: 'bg-green-50 text-[#0f7b6c]' },
  closed: { th: 'ปิด', cls: 'bg-[#f7f6f3] text-[#787774]' },
  wont_fix: { th: 'ไม่แก้ไข', cls: 'bg-[#f7f6f3] text-[#787774]' },
};

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

export default function MyBugReports() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/bug-reports/my');
      setList(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function del(id) {
    if (!window.confirm('ลบรายงานนี้?')) return;
    try {
      await api.delete(`/bug-reports/${id}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'ลบไม่สำเร็จ');
    }
  }

  if (loading) return <div className="text-[#787774] text-sm">กำลังโหลด...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#37352f] mb-1">บั๊กที่ฉันแจ้ง</h1>
        <p className="text-sm text-[#787774]">รายการบั๊กและข้อเสนอแนะของคุณ</p>
      </div>

      {list.length === 0 && (
        <div className="text-center py-12 text-[#787774] notion-card">
          <Bug size={32} className="mx-auto mb-2 opacity-40" />
          <div className="text-sm">คุณยังไม่ได้แจ้งบั๊ก กดปุ่ม 🔺 มุมล่างขวาเพื่อแจ้ง</div>
        </div>
      )}

      <div className="space-y-2">
        {list.map((r) => {
          const status = STATUS_LABEL[r.status];
          const severity = SEVERITY_LABEL[r.severity];
          return (
            <div key={r._id} className="notion-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`badge ${status.cls}`}>{status.th}</span>
                    <span className={`badge ${severity.cls}`}>{severity.th}</span>
                    <span className="badge bg-[#f7f6f3] text-[#787774]">{CATEGORY_LABEL[r.category]}</span>
                  </div>
                  <div className="font-semibold text-[#37352f]">{r.title}</div>
                  <div className="text-sm text-[#37352f] mt-1 whitespace-pre-wrap">{r.description}</div>

                  {r.screenshotUrl && (
                    <a href={r.screenshotUrl} target="_blank" rel="noreferrer">
                      <img src={r.screenshotUrl} className="mt-2 max-h-32 rounded border border-[#e9e9e7]" alt="" />
                    </a>
                  )}

                  {r.adminNote && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-[#2383e2]">
                      💬 <span className="font-medium">Admin:</span> {r.adminNote}
                    </div>
                  )}

                  <div className="text-xs text-[#aeacaa] mt-2">
                    {new Date(r.createdAt).toLocaleString('th-TH')}
                    {r.pageUrl && <span> · หน้า: <code className="bg-[#f7f6f3] px-1 rounded">{r.pageUrl}</code></span>}
                  </div>
                </div>

                {r.status === 'open' && (
                  <button onClick={() => del(r._id)} className="btn-danger">
                    <Trash2 size={13} /> ลบ
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
