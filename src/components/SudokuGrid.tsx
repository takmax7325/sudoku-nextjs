// ============================================================
// SudokuGrid.tsx — 9×9 グリッド UI
// ============================================================

'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { CellHighlight } from '@/hooks/useGame';

interface SudokuGridProps {
  getCellHighlight: (row: number, col: number) => CellHighlight;
}

export default function SudokuGrid({ getCellHighlight }: SudokuGridProps) {
  const { board, solution, selectCell, inputNumber, currentHint, isComplete } = useGameStore();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressedCell, setPressedCell] = useState<[number, number] | null>(null);

  const handlePointerDown = useCallback(
    (row: number, col: number) => {
      setPressedCell([row, col]);
      longPressTimer.current = setTimeout(() => {
        // 長押し → ペンシルモード風に候補表示（ここではセル選択のみ）
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(30);
        }
        useGameStore.getState().togglePencilMode();
      }, 500);
    },
    []
  );

  const handlePointerUp = useCallback(
    (row: number, col: number) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      const { pencilMode } = useGameStore.getState();
      selectCell(row, col);
    },
    [selectCell]
  );

  const handlePointerLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <div className="relative select-none touch-none">
      {/* 完了オーバーレイ */}
      {isComplete && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="text-center animate-slide-up">
            <div className="text-5xl mb-2">🎉</div>
            <p className="text-2xl font-bold text-white">完成！</p>
          </div>
        </div>
      )}

      <div
        className="grid grid-cols-9 gap-0 rounded-xl overflow-hidden"
        style={{
          border: '3px solid #ffffff',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const highlight = getCellHighlight(r, c);
            const isHint = currentHint?.affectedCells.some(([hr, hc]) => hr === r && hc === c);

            return (
              <Cell
                key={`${r}-${c}`}
                row={r}
                col={c}
                cell={cell}
                highlight={highlight}
                isHint={!!isHint}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Cell コンポーネント
// ────────────────────────────────────────────────────────────

interface CellProps {
  row: number;
  col: number;
  cell: {
    value: number | null;
    pencilMarks: Set<number>;
    isGiven: boolean;
    isError: boolean;
  };
  highlight: CellHighlight;
  isHint: boolean;
  onPointerDown: (r: number, c: number) => void;
  onPointerUp: (r: number, c: number) => void;
  onPointerLeave: () => void;
}

const Cell = React.memo(function Cell({
  row,
  col,
  cell,
  highlight,
  isHint,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
}: CellProps) {
  const hasPencil = cell.value === null && cell.pencilMarks.size > 0;

  // ボックス境界のボーダー
  const borderRight = (col + 1) % 3 === 0 && col < 8 ? '3px solid #ffffff' : '1.5px solid rgba(255,255,255,0.3)';
  const borderBottom = (row + 1) % 3 === 0 && row < 8 ? '3px solid #ffffff' : '1.5px solid rgba(255,255,255,0.3)';

  // 背景色
  let bg = '#1e293b'; // default surface
  if (highlight === 'selected') bg = '#1e3a8a';
  else if (highlight === 'hint') bg = '#3b0764';
  else if (highlight === 'sameNumber') bg = '#1d3461';
  else if (highlight === 'peer') bg = '#1e2d40';

  // テキスト色
  let textColor = '#f1f5f9';
  if (cell.isError) textColor = '#f87171';
  else if (!cell.isGiven) textColor = '#7dd3fc';

  return (
    <div
      className={`relative flex items-center justify-center cursor-pointer transition-all duration-100
        ${isHint ? 'animate-pulse-hint' : ''}
        active:scale-95
      `}
      style={{
        width: 'clamp(32px, 10vw, 56px)',
        height: 'clamp(32px, 10vw, 56px)',
        background: bg,
        borderRight,
        borderBottom,
        WebkitTapHighlightColor: 'transparent',
      }}
      onPointerDown={() => onPointerDown(row, col)}
      onPointerUp={() => onPointerUp(row, col)}
      onPointerLeave={onPointerLeave}
      role="button"
      tabIndex={0}
      aria-label={`Row ${row + 1} Col ${col + 1}${cell.value ? ` value ${cell.value}` : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onPointerUp(row, col);
      }}
    >
      {/* ヒントリング */}
      {isHint && (
        <div className="absolute inset-0 rounded-sm border-2 border-violet-400 pointer-events-none z-10" />
      )}

      {/* 数字表示 */}
      {cell.value !== null && !hasPencil && (
        <span
          className={`font-bold leading-none select-none
            ${cell.isGiven ? 'font-extrabold' : 'animate-pop'}
          `}
          style={{
            fontSize: 'clamp(14px, 4vw, 22px)',
            color: textColor,
          }}
        >
          {cell.value}
        </span>
      )}

      {/* ペンシルマーク */}
      {hasPencil && (
        <PencilMarks marks={cell.pencilMarks} />
      )}
    </div>
  );
});

// ────────────────────────────────────────────────────────────
// PencilMarks
// ────────────────────────────────────────────────────────────

function PencilMarks({ marks }: { marks: Set<number> }) {
  return (
    <div
      className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5"
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <div
          key={n}
          className="flex items-center justify-center"
          style={{ fontSize: 'clamp(6px, 1.8vw, 9px)', color: '#94a3b8', lineHeight: 1 }}
        >
          {marks.has(n) ? n : ''}
        </div>
      ))}
    </div>
  );
}
