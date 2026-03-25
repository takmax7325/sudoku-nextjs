// ============================================================
// ClearOverlay.tsx — パズルクリア時の祝福オーバーレイ
// ============================================================

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatTime } from '@/hooks/useGame';

// 紙吹雪の色
const COLORS = [
  '#fbbf24', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#10b981', '#f97316', '#7dd3fc', '#a78bfa',
];

interface Piece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  isCircle: boolean;
  spin: number;
}

function makeConfetti(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 2.5,
    duration: 2.2 + Math.random() * 2,
    size: 6 + Math.random() * 9,
    isCircle: Math.random() > 0.5,
    spin: 360 + Math.floor(Math.random() * 360),
  }));
}

export default function ClearOverlay() {
  const { isComplete, timer, difficulty, newGame } = useGameStore();
  const [show, setShow] = useState(false);
  const confetti = useMemo(() => makeConfetti(50), []);

  useEffect(() => {
    if (isComplete) {
      // 最後のマスのアニメーション後に表示
      const t = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(t);
    } else {
      setShow(false);
    }
  }, [isComplete]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        animation: 'overlay-fade 0.3s ease-out',
      }}
    >
      {/* ── 紙吹雪 ── */}
      {confetti.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-16px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in both`,
          }}
        />
      ))}

      {/* ── メインカード ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          animation: 'clear-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* 絵文字 */}
        <div
          style={{
            fontSize: 'clamp(56px, 16vw, 80px)',
            lineHeight: 1,
            animation: 'emoji-spin 0.7s ease-out both',
          }}
        >
          🎉
        </div>

        {/* クリア テキスト */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 'clamp(52px, 15vw, 84px)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            クリア！
          </div>
          <div
            style={{
              marginTop: '10px',
              color: '#94a3b8',
              fontSize: 'clamp(13px, 3.5vw, 16px)',
              letterSpacing: '0.06em',
            }}
          >
            タイム：{formatTime(timer)}
          </div>
        </div>

        {/* ★ 5つ */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: 'clamp(22px, 6vw, 30px)',
                color: '#f59e0b',
                display: 'inline-block',
                animation: `star-appear 0.35s ${0.4 + i * 0.1}s ease-out both`,
              }}
            >
              ★
            </span>
          ))}
        </div>

        {/* ── ボタン ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: 'clamp(200px, 65vw, 280px)',
            marginTop: '8px',
            animation: 'fade-in-up 0.4s 0.9s ease-out both',
          }}
        >
          {/* 次の問題へ */}
          <button
            onClick={() => {
              setShow(false);
              newGame(difficulty);
            }}
            style={{
              padding: '15px 24px',
              borderRadius: '18px',
              fontWeight: 800,
              fontSize: 'clamp(15px, 4vw, 18px)',
              color: '#0f172a',
              background: 'linear-gradient(135deg, #fde68a, #fbbf24, #f59e0b)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 30px rgba(251,191,36,0.45)',
              letterSpacing: '0.03em',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 36px rgba(251,191,36,0.6)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 30px rgba(251,191,36,0.45)';
            }}
          >
            次の問題へ →
          </button>

          {/* ホームへ */}
          <button
            onClick={() => {
              setShow(false);
              useGameStore.setState({ screen: 'home' });
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '16px',
              fontWeight: 600,
              fontSize: 'clamp(13px, 3.5vw, 15px)',
              color: '#94a3b8',
              background: 'rgba(30,41,59,0.85)',
              border: '1px solid rgba(71,85,105,0.5)',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#cbd5e1';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = '#94a3b8';
            }}
          >
            ホームへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}
