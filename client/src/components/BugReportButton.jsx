import { useState } from 'react';
import api from '../api/client';
import { Bug, X, CheckCircle, Send } from 'lucide-react';

const CATEGORIES = [
  { value: 'ui', label: 'หน้าตา / UI' },
  { value: 'functionality', label: 'ฟังก์ชันใช้ไม่ได้' },
  { value: 'performance', label: 'ช้า / ค้าง' },
  { value: 'data', label: 'ข้อมูลผิด' },
  { value: 'suggestion', label: 'ข้อเสนอแนะ' },
  { value: 'other', label: 'อื่นๆ' },
];

const SEVERITIES = [
  { value: 'low', label: 'น้อย' },
  { value: 'medium', label: 'ปานกลาง' },
  { value: 'high', label: 'มาก' },
  { value: 'critical', label: 'วิกฤติ' },
];

export default function BugReportButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [severity, setSeverity] = useState('medium');
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setTitle(''); setDescription(''); setCategory('other'); setSeverity('medium');
    setScreenshot(null); setPreview(''); setError(''); setSuccess(false);
  }

  function close() { setOpen(false); reset(); }

  function onFileChange(e) {
    const file = e.target.files[0];
    if (file) { setScreenshot(file); setPreview(URL.createObjectURL(file)); }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !description.trim()) {
      setError('กรุณากรอกหัวข้อและรายละเอียด'); return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', title); fd.append('description', description);
      fd.append('category', category); fd.append('severity', severity);
      fd.append('pageUrl', window.location.pathname);
      if (screenshot) fd.append('screenshot', screenshot);
      await api.post('/bug-reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
      setTimeout(close, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'ส่งรายงานไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} title="แจ้งบั๊ก / ข้อเสนอแนะ"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-[#c33b32] hover:bg-[#a8322a] text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105">
        <Bug size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={close}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e6e1da]">
              <h3 className="font-semibold text-lg text-[#221f26] flex items-center gap-2">
                <Bug size={18} className="text-[#c33b32]" /> แจ้งบั๊ก / ข้อเสนอแนะ
              </h3>
              <button onClick={close} className="text-[#6c6770] hover:text-[#221f26]">
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <CheckCircle size={48} className="text-[#0f7b6c] mx-auto mb-3" />
                <div className="text-[#0f7b6c] font-medium">ส่งรายงานเรียบร้อยแล้ว!</div>
                <div className="text-sm text-[#6c6770] mt-2">ขอบคุณที่ช่วยให้ระบบดีขึ้น</div>
              </div>
            ) : (
              <form onSubmit={submit} className="p-5 space-y-3">
                {error && <div className="bg-red-50 border border-red-100 text-[#c33b32] text-sm p-3 rounded">{error}</div>}

                <div>
                  <label className="block text-xs font-medium text-[#6c6770] uppercase tracking-wider mb-1">หัวข้อ *</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200}
                    placeholder="สรุปสั้นๆ ว่าเจอปัญหาอะไร" className="notion-input" required />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6c6770] uppercase tracking-wider mb-1">รายละเอียด *</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} rows={4}
                    placeholder="ทำขั้นตอนอะไร เกิดอะไรขึ้น คาดว่าควรเป็นยังไง"
                    className="notion-input" required />
                  <div className="text-xs text-[#9d97a0] mt-1">{description.length} / 5000</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#6c6770] uppercase tracking-wider mb-1">ประเภท</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="notion-input">
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6c6770] uppercase tracking-wider mb-1">ความรุนแรง</label>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="notion-input">
                      {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6c6770] uppercase tracking-wider mb-1">แนบรูป (ไม่บังคับ)</label>
                  <input type="file" accept="image/*" onChange={onFileChange}
                    className="block w-full text-sm text-[#6c6770]
                      file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0
                      file:text-sm file:bg-[#f3f0ea] file:text-[#221f26] hover:file:bg-[#ebe6df]" />
                  {preview && <img src={preview} className="mt-2 w-full max-h-40 object-contain border border-[#e6e1da] rounded" alt="" />}
                </div>

                <div className="text-xs text-[#9d97a0]">
                  หน้าที่อยู่ขณะนี้: <code className="bg-[#f3f0ea] px-1 rounded">{window.location.pathname}</code>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-[#e6e1da]">
                  <button type="button" onClick={close} className="btn-secondary">ยกเลิก</button>
                  <button type="submit" disabled={submitting}
                    className="inline-flex items-center gap-1 bg-[#c33b32] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#a8322a] disabled:opacity-50">
                    <Send size={14} /> {submitting ? 'กำลังส่ง...' : 'ส่งรายงาน'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
