'use client';

import { useEffect } from 'react';

export default function Error({
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
    <div
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
      }}
    >
      <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>エラーが発生しました</h2>
      <p style={{ fontSize: '14px', color: '#94a3b8' }}>
        申し訳ありません。予期しないエラーが発生しました。
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
        もう一度試す
      </button>
    </div>
  );
}
