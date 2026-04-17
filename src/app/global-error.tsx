'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ja">
      <body
        style={{
          minHeight: '100vh',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f1f5f9',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
          margin: 0,
          fontFamily: 'sans-serif',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>アプリの読み込みに失敗しました</h2>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>
          ページを再読み込みして再度お試しください。
        </p>
        <button
          onClick={reset}
          style={{
            padding: '10px 24px',
            borderRadius: '10px',
            background: '#1e40af',
            color: '#fff',
            border: 'none',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          再読み込み
        </button>
      </body>
    </html>
  );
}
