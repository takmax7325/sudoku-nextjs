// ============================================================
// SudokuGrid.tsx — 9×9 グリッド UI
// ============================================================

'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GAME_THEME } from '@/lib/theme';
import type { CellHighlight } from '@/hooks/useGame';

interface SudokuGridProps {
  getCellHighlight: (row: number, col: number) => CellHighlight;
}

export default function SudokuGrid({ getCellHighlight }: SudokuGridProps) {
  const { board, selectCell, currentHint, isComplete, theme } = useGameStore();
  const gt = GAME_THEME[theme];
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
          border: `3px solid ${gt.gridBorder}`,
          boxShadow: theme === 'dark'
            ? '0 0 40px rgba(0,0,0,0.5)'
            : '0 4px 24px rgba(30,41,59,0.15)',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
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
                theme={theme}
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
  theme: 'dark' | 'light';
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
  theme,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
}: CellProps) {
  const gt = GAME_THEME[theme];
  const hasPencil = cell.value === null && cell.pencilMarks.size > 0;

  // ボックス境界のボーダー
  const borderRight = (col + 1) % 3 === 0 && col < 8 ? `3px solid ${gt.cellBorderBold}` : `1.5px solid ${gt.cellBorderLight}`;
  const borderBottom = (row + 1) % 3 === 0 && row < 8 ? `3px solid ${gt.cellBorderBold}` : `1.5px solid ${gt.cellBorderLight}`;

  // 背景色
  let bg: string = gt.cellDefault;
  if (highlight === 'selected') bg = gt.cellSelected;
  else if (highlight === 'hint') bg = gt.cellHint;
  else if (highlight === 'sameNumber') bg = gt.cellSameNumber;
  else if (highlight === 'peer') bg = gt.cellPeer;

  // テキスト色
  let textColor: string = gt.cellTextGiven;
  if (cell.isError) textColor = '#f87171';
  else if (!cell.isGiven) textColor = gt.cellTextUser;

  return (
    <div
      className={`relative flex items-center justify-center cursor-pointer transition-all duration-100
        ${isHint ? 'animate-pulse-hint' : ''}
        active:scale-95
      `}
      style={{
        width: 'var(--cell-size)',
        height: 'var(--cell-size)',
        background: bg,
        borderRight,
        borderBottom,
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 0.15s ease',
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
            fontSize: 'calc(var(--cell-size) * 0.52)',
            color: textColor,
          }}
        >
          {cell.value}
        </span>
      )}

      {/* ペンシルマーク */}
      {hasPencil && (
        <PencilMarks marks={cell.pencilMarks} color={gt.pencilMarkColor} />
      )}
    </div>
  );
});

// ────────────────────────────────────────────────────────────
// PencilMarks
// ────────────────────────────────────────────────────────────

function PencilMarks({ marks, color }: { marks: Set<number>; color: string }) {
  return (
    <div
      className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5"
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <div
          key={n}
          className="flex items-center justify-center"
          style={{ fontSize: 'calc(var(--cell-size) * 0.22)', color, lineHeight: 1 }}
        >
          {marks.has(n) ? n : ''}
        </div>
      ))}
    </div>
  );
}
