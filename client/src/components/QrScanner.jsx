import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScanner({ onScan, onError }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (text) => {
        scanner.stop().catch(() => {});
        onScan(text);
      },
      () => {}
    ).catch((err) => {
      if (onError) onError(err.toString());
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return <div id="qr-reader" className="w-full max-w-sm mx-auto" />;
}
