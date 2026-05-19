import { useEffect, useRef } from 'react';

export default function QrScanner({ onScan, onError }) {
  const scannerRef = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    let scanner;
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      return scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          scanner.stop().catch(() => {});
          onScan(text);
        },
        () => {}
      );
    }).catch((err) => {
      if (onError) onError(err.toString());
    });

    return () => {
      if (scanner) scanner.stop().catch(() => {});
    };
  }, []);

  return <div id="qr-reader" className="w-full max-w-sm mx-auto" />;
}
