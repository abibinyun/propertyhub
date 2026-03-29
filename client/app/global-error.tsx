'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#f8fafc' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
              Terjadi Kesalahan
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Aplikasi mengalami masalah. Silakan muat ulang halaman.
            </p>
            <button
              onClick={reset}
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
