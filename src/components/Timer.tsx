// ============================================================
// Timer.tsx — タイマー表示
// 数字タップ → 開始 / 一時停止
// 目アイコン（左）→ 表示 / 非表示
// ============================================================

'use client';

import React, { useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatTime } from '@/hooks/useGame';

export default function Timer() {
  const { timer, isTimerRunning, isComplete, toggleTimer } = useGameStore();
  const [hidden, setHidden] = useState(false);

  const toggleHide = useCallback(() => setHidden(h => !h), []);

  // 未開始（timer=0 かつ停止中）は白、動作中 → 白、停止中 → 赤、完了 → 緑
  const notStarted = !isTimerRunning && timer === 0 && !isComplete;
  const timeColor = isComplete ? '#4ade80' : (isTimerRunning || notStarted) ? '#f1f5f9' : '#f87171';

  return (
    // 全体を固定幅コンテナで包み、中身がズレても外側が動かないようにする
    <div className="flex items-center gap-2">

      {/* 目アイコン：左側・固定サイズ */}
      <button
        onClick={toggleHide}
        className="flex items-center justify-center rounded-lg transition-all
          hover:bg-white/10 active:scale-90 flex-shrink-0"
        style={{ width: '28px', height: '28px', color: '#475569' }}
        aria-label={hidden ? 'タイマーを表示' : 'タイマーを隠す'}
      >
        {hidden ? <EyeOffIcon /> : <EyeIcon />}
      </button>

      {/* 数字部分：タップで開始 / 一時停止・固定サイズで位置ズレなし */}
      <button
        onClick={!isComplete ? toggleTimer : undefined}
        className="flex flex-col items-center active:scale-95 select-none"
        style={{
          cursor: isComplete ? 'default' : 'pointer',
          // 幅を固定してコンテンツ変化でレイアウトが動かないようにする
          width: 'clamp(80px, 20vw, 110px)',
        }}
        aria-label={isTimerRunning ? '一時停止' : '再開'}
      >
        <div className="flex items-center justify-center gap-2 w-full">
          {isComplete && <span className="text-lg" style={{ color: timeColor }}>✓</span>}
          <span
            style={{
              fontSize: 'clamp(22px, 5.5vw, 30px)',
              fontFamily: '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", ui-monospace, monospace',
              fontWeight: 700,
              letterSpacing: '0.08em',
              fontVariantNumeric: 'tabular-nums',
              color: timeColor,
            }}
          >
            {hidden ? '--:--' : formatTime(timer)}
          </span>
        </div>
        {/* 常にスペースを確保、一時停止中（開始後のみ）にのみ文字を表示 */}
        {!isComplete && (
          <span style={{
            fontSize: '10px',
            color: '#f87171',
            letterSpacing: '0.1em',
            // 未開始 or 動作中 → 非表示（スペースは確保）
            visibility: (!isTimerRunning && !notStarted) ? 'visible' : 'hidden',
          }}>
            一時停止中
          </span>
        )}
      </button>

    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
