import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScan }) => {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          qrbox: { width: 250, height: 250 },
          fps: 5,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          scanner.clear();
          setScanning(false);
        },
        (error) => {
          console.warn('QR scan error:', error);
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      };
    }
  }, [scanning, onScan]);

  const startScanning = () => {
    setScanning(true);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setScanning(false);
  };

  return (
    <div className="qr-scanner">
      {!scanning ? (
        <button className="btn btn-primary" onClick={startScanning}>
          Start Camera Scanner
        </button>
      ) : (
        <div>
          <div id="qr-reader" style={{ width: '100%' }}></div>
          <button className="btn btn-secondary" onClick={stopScanning}>
            Stop Scanner
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
