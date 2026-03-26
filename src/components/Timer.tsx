// ============================================================
// Timer.tsx — タイマー表示
// 数字タップ → 開始 / 一時停止
// 目アイコン（左）→ 表示 / 非表示
// ============================================================

'use client';

import React, { useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GAME_THEME } from '@/lib/theme';
import { formatTime } from '@/hooks/useGame';

export default function Timer() {
  const { timer, isTimerRunning, isComplete, toggleTimer, theme } = useGameStore();
  const gt = GAME_THEME[theme];
  const [hidden, setHidden] = useState(false);

  const toggleHide = useCallback(() => setHidden(h => !h), []);

  // 未開始（timer=0 かつ停止中）は primary、動作中 → primary、停止中 → 赤、完了 → 緑
  const notStarted = !isTimerRunning && timer === 0 && !isComplete;
  const timeColor = isComplete ? '#4ade80' : (isTimerRunning || notStarted)
    ? (theme === 'dark' ? '#f1f5f9' : '#1e293b')
    : '#f87171';

  return (
    <div className="flex items-center gap-2">

      {/* 目アイコン：左側・固定サイズ */}
      <button
        onClick={toggleHide}
        className="flex items-center justify-center rounded-lg transition-all
          hover:bg-black/5 active:scale-90 flex-shrink-0"
        style={{ width: '28px', height: '28px', color: gt.timerIconColor }}
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
          width: 'clamp(100px, 25vw, 140px)',
        }}
        aria-label={isTimerRunning ? '一時停止' : '再開'}
      >
        <div className="flex items-center justify-center gap-2 w-full">
          {isComplete && <span className="text-lg" style={{ color: timeColor }}>✓</span>}
          {(() => {
            const timeStr = hidden ? '--:--' : formatTime(timer);
            const [left, right] = timeStr.split(':');
            const digitStyle: React.CSSProperties = {
              fontSize: 'clamp(30px, 7.5vw, 42px)',
              fontFamily: '"DIN Alternate Bold", "DIN Alternate", "DIN Condensed", "D-DIN", "Bebas Neue", "Arial Narrow", sans-serif',
              fontWeight: 700,
              letterSpacing: '0.04em',
              fontVariantNumeric: 'tabular-nums',
              color: timeColor,
              transition: 'color 0.3s ease',
              lineHeight: 1,
            };
            return (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span style={digitStyle}>{left}</span>
                <span style={{
                  ...digitStyle,
                  position: 'relative',
                  bottom: '0.12em',
                  marginInline: '0.04em',
                  letterSpacing: 0,
                }}>:</span>
                <span style={digitStyle}>{right}</span>
              </span>
            );
          })()}
        </div>
        {/* 常にスペースを確保、一時停止中（開始後のみ）にのみ文字を表示 */}
        {!isComplete && (
          <span style={{
            fontSize: '10px',
            color: gt.timerSubText,
            letterSpacing: '0.1em',
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
