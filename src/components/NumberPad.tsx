// ============================================================
// NumberPad.tsx — 数字入力パッド
// ============================================================

'use client';

import React, { useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GAME_THEME } from '@/lib/theme';

export default function NumberPad() {
  const { board, selectedCell, inputNumber, pencilMode, theme } = useGameStore();
  const gt = GAME_THEME[theme];

  // 各数字の残り入力可能回数を計算
  const numCounts = React.useMemo(() => {
    const counts: Record<number, number> = {};
    for (let n = 1; n <= 9; n++) {
      const placed = board.flat().filter(c => c.value === n).length;
      counts[n] = 9 - placed;
    }
    return counts;
  }, [board]);

  // 現在選択セルの候補（ペンシルモード表示用）
  const selectedPencilMarks = React.useMemo(() => {
    if (!selectedCell) return new Set<number>();
    const [r, c] = selectedCell;
    return board[r][c].pencilMarks;
  }, [selectedCell, board]);

  const handleNumber = useCallback(
    (n: number) => {
      inputNumber(n);
    },
    [inputNumber]
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 数字ボタン */}
      <div className="grid grid-cols-9 gap-1 sm:gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
          const remaining = numCounts[n];
          const isActive = pencilMode && selectedPencilMarks.has(n);
          const isComplete = remaining === 0;

          return (
            <button
              key={n}
              onClick={() => handleNumber(n)}
              disabled={isComplete}
              className={`
                relative flex flex-col items-center justify-center rounded-lg
                transition-all duration-100 active:scale-90 select-none
                font-bold
                ${isComplete ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:brightness-105 active:brightness-110'}
                ${isActive ? 'ring-2 ring-violet-400' : ''}
              `}
              style={{
                width: 'clamp(30px, 8.5vw, 52px)',
                height: 'clamp(46px, 12vw, 70px)',
                background: isActive ? gt.numPadActiveBg : gt.numPadBg,
                border: `1px solid ${gt.numPadBorder}`,
                fontSize: 'clamp(16px, 4.5vw, 26px)',
                color: gt.numPadText,
                transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
              }}
              aria-label={`Input ${n}, ${remaining} remaining`}
            >
              <span>{n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
