import { useState } from 'react';
import api from '../api/client';

const CATEGORIES = [
  { value: 'ui', label: 'หน้าตา / UI' },
  { value: 'functionality', label: 'ฟังก์ชันใช้ไม่ได้' },
  { value: 'performance', label: 'ช้า / ค้าง' },
  { value: 'data', label: 'ข้อมูลผิด' },
  { value: 'suggestion', label: 'ข้อเสนอแนะ' },
  { value: 'other', label: 'อื่นๆ' },
];

const SEVERITIES = [
  { value: 'low', label: 'น้อย', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'ปานกลาง', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'มาก', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'วิกฤติ', color: 'bg-red-100 text-red-700' },
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
    setTitle('');
    setDescription('');
    setCategory('other');
    setSeverity('medium');
    setScreenshot(null);
    setPreview('');
    setError('');
    setSuccess(false);
  }

  function close() {
    setOpen(false);
    reset();
  }

  function onFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !description.trim()) {
      setError('กรุณากรอกหัวข้อและรายละเอียด');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('category', category);
      fd.append('severity', severity);
      fd.append('pageUrl', window.location.pathname);
      if (screenshot) fd.append('screenshot', screenshot);

      await api.post('/bug-reports', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
      {/* Floating action button */}
      <button
        onClick={() => setOpen(true)}
        title="แจ้งบั๊ก / ข้อเสนอแนะ"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={close}>
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg">แจ้งบั๊ก / ข้อเสนอแนะ</h3>
              <button onClick={close} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <div className="text-5xl mb-3">✅</div>
                <div className="text-green-700 font-medium">ส่งรายงานเรียบร้อยแล้ว!</div>
                <div className="text-sm text-gray-500 mt-2">ขอบคุณที่ช่วยให้ระบบดีขึ้น</div>
              </div>
            ) : (
              <form onSubmit={submit} className="p-4 space-y-3">
                {error && (
                  <div className="bg-red-50 text-red-700 text-sm p-3 rounded">{error}</div>
                )}

                <div>
                  <label className="block text-sm text-gray-700 mb-1">หัวข้อ *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    placeholder="สรุปสั้นๆ ว่าเจอปัญหาอะไร"
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">รายละเอียด *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={5000}
                    rows={4}
                    placeholder="ทำขั้นตอนอะไร เกิดอะไรขึ้น คาดว่าควรเป็นยังไง"
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                  <div className="text-xs text-gray-400 mt-1">{description.length} / 5000</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">ประเภท</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="border rounded px-3 py-2 w-full"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">ความรุนแรง</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="border rounded px-3 py-2 w-full"
                    >
                      {SEVERITIES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">แนบรูป (ไม่บังคับ)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-2 file:py-2 file:px-3 file:rounded file:border-0
                      file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  />
                  {preview && (
                    <img src={preview} className="mt-2 w-full max-h-40 object-contain border rounded" alt="" />
                  )}
                </div>

                <div className="text-xs text-gray-400">
                  หน้าที่อยู่ขณะนี้: <code>{window.location.pathname}</code>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t">
                  <button
                    type="button"
                    onClick={close}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {submitting ? 'กำลังส่ง...' : 'ส่งรายงาน'}
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
