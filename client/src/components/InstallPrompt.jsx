import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

// Shows a small "ติดตั้งแอป" banner when the browser supports PWA install
// (fires `beforeinstallprompt`). Hidden once installed or dismissed.
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('pwa-install-dismissed') === '1'
  );

  useEffect(() => {
    function onPrompt(e) {
      e.preventDefault();
      setDeferred(e);
    }
    function onInstalled() {
      setDeferred(null);
    }
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!deferred || dismissed) return null;

  async function install() {
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  function dismiss() {
    sessionStorage.setItem('pwa-install-dismissed', '1');
    setDismissed(true);
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm
      bg-white border border-[#e6e1da] rounded-xl shadow-lg p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-[#6a2c8f] flex items-center justify-center shrink-0">
        <Download size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[#221f26]">ติดตั้งเป็นแอป</div>
        <div className="text-xs text-[#6c6770]">เปิดเร็วขึ้น ใช้งานเต็มจอเหมือนแอปจริง</div>
      </div>
      <button onClick={install} className="btn-primary shrink-0">ติดตั้ง</button>
      <button onClick={dismiss} className="text-[#9d97a0] hover:text-[#6c6770] shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}
