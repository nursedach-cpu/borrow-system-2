import { useState, useEffect } from 'react';
import api from '../../api/client';

const STATUS_LABEL = {
  open: { th: 'ใหม่', color: 'bg-blue-100 text-blue-700' },
  in_progress: { th: 'กำลังตรวจสอบ', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { th: 'แก้ไขแล้ว', color: 'bg-green-100 text-green-800' },
  closed: { th: 'ปิด', color: 'bg-gray-100 text-gray-600' },
  wont_fix: { th: 'ไม่แก้ไข', color: 'bg-gray-100 text-gray-600' },
};

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

  if (loading) return <div className="text-gray-400">กำลังโหลด...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">บั๊กที่ฉันแจ้ง</h2>

      {list.length === 0 && (
        <div className="text-gray-400 text-center py-8 bg-white rounded shadow">
          คุณยังไม่ได้แจ้งบั๊ก กดปุ่ม 🔺 มุมล่างขวาเพื่อแจ้ง
        </div>
      )}

      <div className="space-y-3">
        {list.map((r) => {
          const status = STATUS_LABEL[r.status];
          const severity = SEVERITY_LABEL[r.severity];
          return (
            <div key={r._id} className="bg-white rounded shadow p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>{status.th}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${severity.color}`}>{severity.th}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {CATEGORY_LABEL[r.category]}
                    </span>
                  </div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{r.description}</div>

                  {r.screenshotUrl && (
                    <a href={r.screenshotUrl} target="_blank" rel="noreferrer">
                      <img src={r.screenshotUrl} className="mt-2 max-h-32 rounded border" alt="" />
                    </a>
                  )}

                  {r.adminNote && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-900">
                      💬 <span className="font-medium">Admin:</span> {r.adminNote}
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(r.createdAt).toLocaleString('th-TH')}
                    {r.pageUrl && <span> · หน้า: <code>{r.pageUrl}</code></span>}
                  </div>
                </div>

                {r.status === 'open' && (
                  <button
                    onClick={() => del(r._id)}
                    className="text-sm text-red-600 hover:text-red-800 px-2"
                  >
                    ลบ
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
