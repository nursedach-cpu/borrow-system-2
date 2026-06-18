import { useState, useEffect } from 'react';
import api from '../../api/client';
import QrScanner from '../../components/QrScanner';
import { CheckCircle, Package, Wrench, Search, Camera, Calendar, BookmarkCheck, CalendarClock, RotateCcw } from 'lucide-react';

export default function Scanner() {
  const [scanning, setScanning] = useState(true);
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [queueCount, setQueueCount] = useState(0);
  const [mode, setMode] = useState('borrow');
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');

  useEffect(() => {
    if (item && item.status === 'borrowed') {
      api.get(`/reservations/item/${item._id}/queue`).then((res) => {
        setQueueCount(res.data.count);
      }).catch(() => setQueueCount(0));
    }
  }, [item]);

  async function handleScan(qrCode) {
    setScanning(false);
    setError('');
    try {
      const res = await api.get(`/items/qr/${qrCode}`);
      setItem(res.data);
      setMode(res.data.status === 'available' ? 'borrow' : 'queue');
    } catch (err) {
      setError(err.response?.data?.error || 'ไม่พบของชิ้นนี้ในระบบ');
    }
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  async function handleBorrow() {
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/borrows', {
        itemId: item._id,
        dueDate: dueDate || undefined,
        note: note || undefined,
      });
      if (photo) {
        const formData = new FormData();
        formData.append('image', photo);
        await api.post(`/borrows/${res.data._id}/borrow-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setSuccess('ส่งคำขอยืมเรียบร้อย รออนุมัติ');
      setItem(null);
    } catch (err) {
      setError(err.response?.data?.error || 'ส่งคำขอไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleQueue() {
    setError('');
    setSubmitting(true);
    try {
      await api.post('/reservations/queue', { itemId: item._id, note: note || undefined });
      setSuccess('จองคิวเรียบร้อย ระบบจะแจ้งเมื่อถึงคิวของคุณ');
      setItem(null);
    } catch (err) {
      setError(err.response?.data?.error || 'จองคิวไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSchedule() {
    setError('');
    if (!scheduleStart || !scheduleEnd) {
      setError('กรุณาเลือกช่วงเวลา');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/reservations/schedule', {
        itemId: item._id, startDate: scheduleStart, endDate: scheduleEnd, note: note || undefined,
      });
      setSuccess('จองล่วงหน้าเรียบร้อย รออนุมัติ');
      setItem(null);
    } catch (err) {
      setError(err.response?.data?.error || 'จองไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setScanning(true); setItem(null); setError(''); setSuccess('');
    setDueDate(''); setNote(''); setManualCode(''); setCameraError(false);
    setPhoto(null); setPhotoPreview(''); setMode('borrow');
    setScheduleStart(''); setScheduleEnd(''); setQueueCount(0);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#37352f] mb-1">สแกน QR Code</h1>
        <p className="text-sm text-[#787774]">สแกน QR Code หรือพิมพ์รหัสเพื่อยืมอุปกรณ์</p>
      </div>

      {success && (
        <div className="notion-card border-green-100 bg-green-50 mb-4 max-w-md">
          <div className="flex items-center gap-2 text-[#0f7b6c]">
            <CheckCircle size={18} />
            <span className="font-medium">{success}</span>
          </div>
          <button onClick={reset} className="block mt-2 text-sm text-[#0f7b6c] underline">สแกนใหม่</button>
        </div>
      )}

      {error && (
        <div className="notion-card border-red-100 bg-red-50 mb-4 max-w-md">
          <div className="text-[#e03e3e]">{error}</div>
          <button onClick={reset} className="block mt-2 text-sm text-[#e03e3e] underline">ลองใหม่</button>
        </div>
      )}

      {scanning && !success && (
        <div>
          {!cameraError && <QrScanner onScan={handleScan} onError={() => setCameraError(true)} />}

          <div className="max-w-sm mx-auto mt-4 notion-card">
            <p className="text-sm text-[#787774] mb-2">
              {cameraError ? 'ไม่สามารถเปิดกล้องได้ — ' : ''}พิมพ์รหัส QR Code แทน
            </p>
            <div className="flex gap-2">
              <input value={manualCode} onChange={(e) => setManualCode(e.target.value)}
                placeholder="รหัส QR Code" className="notion-input" />
              <button onClick={() => manualCode.trim() && handleScan(manualCode.trim())}
                className="btn-primary"><Search size={14} /> ค้นหา</button>
            </div>
          </div>
        </div>
      )}

      {item && (
        <div className="notion-card max-w-md mx-auto mt-4">
          {item.imageUrl && <img src={item.imageUrl} className="w-full h-40 object-cover rounded mb-3 border border-[#e9e9e7]" alt="" />}
          <h3 className="font-bold text-xl text-[#37352f]">{item.name}</h3>
          {item.category && <div className="text-sm text-[#787774]">{item.category}</div>}
          {item.description && <div className="text-sm text-[#37352f] mt-1">{item.description}</div>}

          <div className={`mt-3 px-3 py-2 rounded text-sm font-medium flex items-center gap-2 ${
            item.status === 'available' ? 'bg-green-50 text-[#0f7b6c]'
              : item.status === 'borrowed' ? 'bg-orange-50 text-[#d9730d]'
              : 'bg-[#f7f6f3] text-[#787774]'
          }`}>
            {item.status === 'available' && <><CheckCircle size={16} /> ของชิ้นนี้ว่าง</>}
            {item.status === 'borrowed' && (
              <><Package size={16} /> ของชิ้นนี้ถูกยืมอยู่
                {queueCount > 0 && <span>(มีคนรอคิว {queueCount} คน)</span>}
              </>
            )}
            {item.status === 'maintenance' && <><Wrench size={16} /> อยู่ระหว่างซ่อม</>}
          </div>

          <div className="flex gap-1 mt-3 border-b border-[#e9e9e7]">
            {item.status === 'available' && (
              <button onClick={() => setMode('borrow')}
                className={`px-3 py-2 text-sm border-b-2 ${mode === 'borrow' ? 'border-[#2383e2] text-[#2383e2] font-medium' : 'border-transparent text-[#787774]'}`}
              >ยืมเลย</button>
            )}
            {item.status === 'borrowed' && (
              <button onClick={() => setMode('queue')}
                className={`px-3 py-2 text-sm border-b-2 ${mode === 'queue' ? 'border-[#7c3aed] text-[#7c3aed] font-medium' : 'border-transparent text-[#787774]'}`}
              >จองคิว</button>
            )}
            <button onClick={() => setMode('schedule')}
              className={`px-3 py-2 text-sm border-b-2 ${mode === 'schedule' ? 'border-sky-600 text-sky-600 font-medium' : 'border-transparent text-[#787774]'}`}
            >จองล่วงหน้า</button>
          </div>

          {mode === 'borrow' && item.status === 'available' && (
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-[#787774] uppercase tracking-wider flex items-center gap-1"><Calendar size={11} /> กำหนดคืน (ไม่บังคับ)</span>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="notion-input mt-1" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-[#787774] uppercase tracking-wider">หมายเหตุ</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="notion-input mt-1" placeholder="เช่น ใช้ในห้องประชุม A" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-[#787774] uppercase tracking-wider flex items-center gap-1"><Camera size={11} /> แนบรูปถ่าย (ไม่บังคับ)</span>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange}
                  className="block w-full text-sm text-[#787774] mt-1
                    file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0
                    file:text-sm file:bg-[#f7f6f3] file:text-[#37352f] hover:file:bg-[#efefee]" />
              </label>
              {photoPreview && (
                <img src={photoPreview} className="w-full h-32 object-cover rounded border border-[#e9e9e7]" alt="" />
              )}
              <button onClick={handleBorrow} disabled={submitting} className="w-full btn-primary justify-center py-2.5">
                {submitting ? 'กำลังส่ง...' : 'ขอยืม'}
              </button>
            </div>
          )}

          {mode === 'queue' && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-[#787774] flex items-center gap-1">
                <BookmarkCheck size={14} /> จองคิวรอยืม — ระบบจะแจ้งเมื่อถึงคิวของคุณ (FIFO)
              </p>
              <label className="block">
                <span className="text-xs font-medium text-[#787774] uppercase tracking-wider">หมายเหตุ (ไม่บังคับ)</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="notion-input mt-1" placeholder="เช่น ต้องใช้เร่งด่วน" />
              </label>
              <button onClick={handleQueue} disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-1 bg-[#7c3aed] text-white px-3 py-2.5 rounded-md text-sm font-medium hover:bg-[#6d28d9] disabled:opacity-50">
                {submitting ? 'กำลังส่ง...' : 'จองคิว'}
              </button>
            </div>
          )}

          {mode === 'schedule' && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-[#787774] flex items-center gap-1">
                <CalendarClock size={14} /> จองล่วงหน้าเป็นช่วงวันที่ — Admin จะอนุมัติก่อน
              </p>
              <label className="block">
                <span className="text-xs font-medium text-[#787774] uppercase tracking-wider">วันที่เริ่ม</span>
                <input type="date" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} className="notion-input mt-1" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-[#787774] uppercase tracking-wider">วันที่สิ้นสุด</span>
                <input type="date" value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)} className="notion-input mt-1" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-[#787774] uppercase tracking-wider">หมายเหตุ (ไม่บังคับ)</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="notion-input mt-1" />
              </label>
              <button onClick={handleSchedule} disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-1 bg-sky-600 text-white px-3 py-2.5 rounded-md text-sm font-medium hover:bg-sky-700 disabled:opacity-50">
                {submitting ? 'กำลังส่ง...' : 'จองล่วงหน้า'}
              </button>
            </div>
          )}

          <button onClick={reset} className="mt-3 inline-flex items-center gap-1 text-sm text-[#787774] hover:text-[#37352f]">
            <RotateCcw size={13} /> สแกนใหม่
          </button>
        </div>
      )}
    </div>
  );
}
