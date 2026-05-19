import { useState } from 'react';
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

  async function handleScan(qrCode) {
    setScanning(false);
    setError('');
    try {
      const res = await api.get(`/items/qr/${qrCode}`);
      setItem(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'ไม่พบของชิ้นนี้ในระบบ');
    }
  }

  async function handleBorrow() {
    setError('');
    try {
      await api.post('/borrows', {
        itemId: item._id,
        dueDate: dueDate || undefined,
        note: note || undefined,
      });
      setSuccess('ส่งคำขอยืมเรียบร้อย รออนุมัติ');
      setItem(null);
    } catch (err) {
      setError(err.response?.data?.error || 'ส่งคำขอไม่สำเร็จ');
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
          {item.imageUrl && <img src={item.imageUrl} className="w-full h-40 object-cover rounded mb-3" />}
          <h3 className="font-bold text-lg">{item.name}</h3>
          {item.category && <div className="text-sm text-gray-500">{item.category}</div>}
          {item.description && <div className="text-sm text-gray-600 mt-1">{item.description}</div>}

          {item.status === 'available' ? (
            <div className="mt-4">
              <label className="block text-sm text-gray-700 mb-1">กำหนดคืน (ไม่บังคับ)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-2" />
              <label className="block text-sm text-gray-700 mb-1">หมายเหตุ</label>
              <input value={note} onChange={(e) => setNote(e.target.value)}
                className="border rounded px-3 py-2 w-full mb-3" placeholder="เช่น ใช้ในห้องประชุม A" />
              <button onClick={handleBorrow}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">ขอยืม</button>
            </div>
          ) : (
            <div className="mt-3 text-yellow-600 font-medium">
              ของชิ้นนี้ถูกยืมอยู่
            </div>
          )}

          <button onClick={reset} className="mt-3 text-sm text-gray-500 underline">สแกนใหม่</button>
        </div>
      )}
    </div>
  );
}
