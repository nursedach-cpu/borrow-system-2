import { useEffect, useRef } from 'react';

export default function QrScanner({ onScan, onError }) {
  const scannerRef = useRef(null);
  const startedRef = useRef(false);
  const handledRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      return scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          // Guard against multiple fires for one scan.
          if (handledRef.current) return;
          handledRef.current = true;
          // IMPORTANT: stop AND clear so html5-qrcode removes the <video>/<canvas>
          // it injected into #qr-reader BEFORE React unmounts this component.
          // Otherwise React tries to removeChild a node it didn't create and the
          // whole app crashes to a white screen.
          scanner
            .stop()
            .then(() => scanner.clear())
            .catch(() => {})
            .finally(() => onScan(text));
        },
        () => {}
      );
    }).catch((err) => {
      if (onError) onError(err.toString());
    });

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().then(() => scanner.clear()).catch(() => {});
      }
    };
  }, []);

  return <div id="qr-reader" className="w-full max-w-sm mx-auto" />;
}
