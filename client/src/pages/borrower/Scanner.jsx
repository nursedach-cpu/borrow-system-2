import { useState, useEffect } from 'react';
import api from '../../api/client';
import QrScanner from '../../components/QrScanner';

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

  // Reservation extras
  const [queueCount, setQueueCount] = useState(0);
  const [mode, setMode] = useState('borrow'); // 'borrow' | 'queue' | 'schedule'
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');
  const [weightInfo, setWeightInfo] = useState(null);

  useEffect(() => {
    api.get('/users/me/weight').then((res) => setWeightInfo(res.data)).catch(() => {});
  }, []);

  // Load queue count whenever a borrowed item is loaded.
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
      await api.post('/reservations/queue', {
        itemId: item._id,
        note: note || undefined,
      });
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
        itemId: item._id,
        startDate: scheduleStart,
        endDate: scheduleEnd,
        note: note || undefined,
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
    setScanning(true);
    setItem(null);
    setError('');
    setSuccess('');
    setDueDate('');
    setNote('');
    setManualCode('');
    setCameraError(false);
    setPhoto(null);
    setPhotoPreview('');
    setMode('borrow');
    setScheduleStart('');
    setScheduleEnd('');
    setQueueCount(0);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">สแกน QR Code</h2>

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded mb-4">
          {success}
          <button onClick={reset} className="block mt-2 text-sm text-green-600 underline">สแกนใหม่</button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-4">
          {error}
          <button onClick={reset} className="block mt-2 text-sm text-red-600 underline">ลองใหม่</button>
        </div>
      )}

      {scanning && !success && (
        <div>
          {!cameraError && (
            <QrScanner onScan={handleScan} onError={() => setCameraError(true)} />
          )}

          <div className="max-w-sm mx-auto mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600 mb-2">
              {cameraError ? 'ไม่สามารถเปิดกล้องได้ — ' : ''}พิมพ์รหัส QR Code แทน
            </p>
            <div className="flex gap-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="รหัส QR Code"
                className="border rounded px-3 py-2 flex-1"
              />
              <button
                onClick={() => manualCode.trim() && handleScan(manualCode.trim())}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >ค้นหา</button>
            </div>
          </div>
        </div>
      )}

      {item && (
        <div className="bg-white rounded shadow p-4 max-w-sm mx-auto mt-4">
          {item.imageUrl && <img src={item.imageUrl} className="w-full h-40 object-cover rounded mb-3" alt="" />}
          <h3 className="font-bold text-lg">{item.name}</h3>
          {item.category && <div className="text-sm text-gray-500">{item.category}</div>}
          {item.description && <div className="text-sm text-gray-600 mt-1">{item.description}</div>}

          {/* Weight info block */}
          {weightInfo && (
            <div className="mt-3 bg-gray-50 rounded p-3 text-sm">
              {item.weight > 0 && (
                <div className="flex justify-between mb-2 text-gray-700">
                  <span>น้ำหนักอุปกรณ์นี้</span>
                  <span className="font-medium">{item.weight} kg</span>
                </div>
              )}
              <div className="flex justify-between mb-1 text-gray-700">
                <span>น้ำหนักฉันตอนนี้</span>
                <span className={
                  weightInfo.currentWeight + (item.weight || 0) > weightInfo.weightLimit
                    ? 'font-medium text-red-600'
                    : 'font-medium text-gray-700'
                }>
                  {weightInfo.currentWeight.toFixed(2)} kg
                  {item.weight > 0 && (
                    <span className="text-gray-400"> + {item.weight} = {(weightInfo.currentWeight + item.weight).toFixed(2)} kg</span>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    weightInfo.currentWeight + (item.weight || 0) > weightInfo.weightLimit
                      ? 'bg-red-500'
                      : (weightInfo.currentWeight + (item.weight || 0)) / weightInfo.weightLimit > 0.8
                        ? 'bg-yellow-400'
                        : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      ((weightInfo.currentWeight + (item.weight || 0)) / weightInfo.weightLimit) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="text-right text-xs text-gray-400">ขีดจำกัด {weightInfo.weightLimit} kg</div>
              {weightInfo.currentWeight + (item.weight || 0) > weightInfo.weightLimit && (
                <div className="mt-2 text-xs text-red-600 font-medium">
                  น้ำหนักจะเกินขีดจำกัด — ไม่สามารถยืมได้
                </div>
              )}
            </div>
          )}

          {/* Status banner */}
          <div className={`mt-3 px-3 py-2 rounded text-sm font-medium ${
            item.status === 'available'
              ? 'bg-green-50 text-green-700'
              : item.status === 'borrowed'
                ? 'bg-yellow-50 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
          }`}>
            {item.status === 'available' && '✓ ของชิ้นนี้ว่าง'}
            {item.status === 'borrowed' && (
              <>📦 ของชิ้นนี้ถูกยืมอยู่ {queueCount > 0 && <span>(มีคนรอคิว {queueCount} คน)</span>}</>
            )}
            {item.status === 'maintenance' && '🛠 อยู่ระหว่างซ่อม'}
          </div>

          {/* Mode tabs — pick action based on availability */}
          <div className="flex gap-1 mt-3 border-b">
            {item.status === 'available' && (
              <button
                onClick={() => setMode('borrow')}
                className={`px-3 py-2 text-sm border-b-2 ${mode === 'borrow' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500'}`}
              >ยืมเลย</button>
            )}
            {item.status === 'borrowed' && (
              <button
                onClick={() => setMode('queue')}
                className={`px-3 py-2 text-sm border-b-2 ${mode === 'queue' ? 'border-purple-600 text-purple-600 font-medium' : 'border-transparent text-gray-500'}`}
              >จองคิว</button>
            )}
            <button
              onClick={() => setMode('schedule')}
              className={`px-3 py-2 text-sm border-b-2 ${mode === 'schedule' ? 'border-sky-600 text-sky-600 font-medium' : 'border-transparent text-gray-500'}`}
            >จองล่วงหน้า</button>
          </div>

          {/* Borrow form */}
          {mode === 'borrow' && item.status === 'available' && (
            <div className="mt-4">
              <label className="block text-sm text-gray-700 mb-1">กำหนดคืน (ไม่บังคับ)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-2" />
              <label className="block text-sm text-gray-700 mb-1">หมายเหตุ</label>
              <input value={note} onChange={(e) => setNote(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-3" placeholder="เช่น ใช้ในห้องประชุม A" />

              <label className="block text-sm text-gray-700 mb-1">แนบรูปถ่าย (ไม่บังคับ)</label>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 mb-2
                  file:mr-2 file:py-2 file:px-3 file:rounded file:border-0
                  file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
              {photoPreview && (
                <img src={photoPreview} className="w-full h-32 object-cover rounded mb-3 border" alt="" />
              )}

              <button onClick={handleBorrow} disabled={submitting}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'กำลังส่ง...' : 'ขอยืม'}
              </button>
            </div>
          )}

          {/* Queue form */}
          {mode === 'queue' && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                จองคิวรอยืม — ระบบจะแจ้งเมื่อถึงคิวของคุณ (ใช้หลัก FIFO)
              </p>
              <label className="block text-sm text-gray-700 mb-1">หมายเหตุ (ไม่บังคับ)</label>
              <input value={note} onChange={(e) => setNote(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-3" placeholder="เช่น ต้องใช้เร่งด่วน" />
              <button onClick={handleQueue} disabled={submitting}
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50">
                {submitting ? 'กำลังส่ง...' : 'จองคิว'}
              </button>
            </div>
          )}

          {/* Schedule form */}
          {mode === 'schedule' && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                จองล่วงหน้าเป็นช่วงวันที่ — Admin จะอนุมัติก่อน
              </p>
              <label className="block text-sm text-gray-700 mb-1">วันที่เริ่ม</label>
              <input type="date" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-2" />
              <label className="block text-sm text-gray-700 mb-1">วันที่สิ้นสุด</label>
              <input type="date" value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-2" />
              <label className="block text-sm text-gray-700 mb-1">หมายเหตุ (ไม่บังคับ)</label>
              <input value={note} onChange={(e) => setNote(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-3" />
              <button onClick={handleSchedule} disabled={submitting}
                className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-700 disabled:opacity-50">
                {submitting ? 'กำลังส่ง...' : 'จองล่วงหน้า'}
              </button>
            </div>
          )}

          <button onClick={reset} className="mt-3 text-sm text-gray-500 underline">สแกนใหม่</button>
        </div>
      )}
    </div>
  );
}
