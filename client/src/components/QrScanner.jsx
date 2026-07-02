import { useEffect, useRef } from 'react';

// html5-qrcode injects its own <video>/<canvas> into the target element and
// later mutates/removes them. If React also "owns" that element's children,
// the two fight over the DOM on unmount and React throws
// "removeChild ... NotFoundError", crashing the whole page.
//
// Fix: React only renders an empty wrapper. We create the scanner's target div
// imperatively as a child of that wrapper, so React never tracks it. On cleanup
// we stop the camera and remove that div ourselves — React never touches it.
export default function QrScanner({ onScan, onError }) {
  const wrapRef = useRef(null);
  const startedRef = useRef(false);
  const handledRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    let scanner = null;

    // A div that belongs to us, not to React's reconciler.
    const target = document.createElement('div');
    target.id = 'qr-reader-target';
    target.style.width = '100%';
    if (wrapRef.current) wrapRef.current.appendChild(target);

    const removeTarget = () => {
      try {
        if (target.parentNode) target.parentNode.removeChild(target);
      } catch { /* already gone */ }
    };

    import('html5-qrcode')
      .then(({ Html5Qrcode }) => {
        if (cancelled) return;
        scanner = new Html5Qrcode(target.id);
        return scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (text) => {
            if (handledRef.current) return;
            handledRef.current = true;
            scanner.stop().then(() => scanner.clear()).catch(() => {}).finally(() => onScan(text));
          },
          () => {}
        );
      })
      .catch((err) => {
        if (onError) onError(err.toString());
      });

    return () => {
      cancelled = true;
      if (scanner) {
        scanner.stop().then(() => scanner.clear()).catch(() => {}).finally(removeTarget);
      } else {
        removeTarget();
      }
    };
  }, []);

  return <div ref={wrapRef} className="w-full max-w-sm mx-auto" />;
}
