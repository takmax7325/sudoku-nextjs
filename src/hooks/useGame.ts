// ============================================================
// useGame.ts — ゲームロジックフック
// ============================================================

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { Difficulty } from '@/lib/types';

export function useGame() {
  const store = useGameStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── タイマー管理
  useEffect(() => {
    if (store.isTimerRunning) {
      timerRef.current = setInterval(() => {
        store.tick();
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [store.isTimerRunning]);

  // ── キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { selectedCell, board, pencilMode } = useGameStore.getState();

      // 数字入力 (1-9)
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        store.inputNumber(parseInt(e.key));
        return;
      }

      // 消去
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        store.eraseCell();
        return;
      }

      // ペンシルモード切替
      if (e.key === 'p' || e.key === 'P') {
        store.togglePencilMode();
        return;
      }

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          store.redo();
        } else {
          store.undo();
        }
        return;
      }

      // 矢印キーでセル移動
      if (!selectedCell) return;
      const [r, c] = selectedCell;

      const moves: Record<string, [number, number]> = {
        ArrowUp: [Math.max(0, r - 1), c],
        ArrowDown: [Math.min(8, r + 1), c],
        ArrowLeft: [r, Math.max(0, c - 1)],
        ArrowRight: [r, Math.min(8, c + 1)],
      };

      if (moves[e.key]) {
        e.preventDefault();
        const [nr, nc] = moves[e.key];
        store.selectCell(nr, nc);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ホーム画面から newGame() で開始するため、自動生成は不要

  // ── フォーマット済みタイマー
  const formattedTimer = formatTime(store.timer);

  // ── ヒントセル群
  const hintCells = store.currentHint?.affectedCells ?? [];

  // ── セルのハイライト計算
  const getCellHighlight = useCallback(
    (row: number, col: number): CellHighlight => {
      const { selectedCell, board, currentHint } = useGameStore.getState();

      // ヒント対象
      if (currentHint?.affectedCells.some(([r, c]) => r === row && c === col)) {
        return 'hint';
      }

      if (!selectedCell) return 'none';
      const [sr, sc] = selectedCell;

      // 選択セル
      if (sr === row && sc === col) return 'selected';

      // 同一数字
      const sv = board[sr][sc].value;
      if (sv !== null && board[row][col].value === sv) return 'sameNumber';

      // 同一行・列・ボックス
      if (
        sr === row ||
        sc === col ||
        (Math.floor(sr / 3) === Math.floor(row / 3) &&
          Math.floor(sc / 3) === Math.floor(col / 3))
      ) {
        return 'peer';
      }

      return 'none';
    },
    [store.selectedCell, store.board, store.currentHint]
  );

  return {
    ...store,
    formattedTimer,
    hintCells,
    getCellHighlight,
  };
}

export type CellHighlight = 'selected' | 'peer' | 'sameNumber' | 'hint' | 'none';

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
