'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#faf9f7',
          color: '#1c1917',
        }}
      >
        <p style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', color: '#9a5b1f' }}>
          Site şu anda kullanılamıyor
        </p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, maxWidth: '32rem' }}>
          Sunucuya ulaşılamadı, lütfen daha sonra tekrar deneyin.
        </h1>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: '0.5rem',
            borderRadius: '9999px',
            background: '#9a5b1f',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Tekrar Dene
        </button>
      </body>
    </html>
  );
}
