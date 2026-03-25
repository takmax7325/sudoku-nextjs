// ============================================================
// gameStore.ts — Zustand 状態管理
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generatePuzzle } from '@/lib/generator';
import { getNextHint } from '@/lib/solver';
import type {
  Difficulty,
  CellState,
  StepLog,
  Statistics,
} from '@/lib/types';
import { DEFAULT_STATISTICS as DEF_STATS } from '@/lib/types';

// ────────────────────────────────────────────────────────────
// ヘルパー
// ────────────────────────────────────────────────────────────

function buildBoard(puzzle: number[][]): CellState[][] {
  return puzzle.map(row =>
    row.map(v => ({
      value: v === 0 ? null : v,
      pencilMarks: new Set<number>(),
      isGiven: v !== 0,
      isError: false,
    }))
  );
}

function cloneBoard(board: CellState[][]): CellState[][] {
  return board.map(row =>
    row.map(cell => ({
      ...cell,
      pencilMarks: new Set(cell.pencilMarks),
    }))
  );
}

function boardToNumbers(board: CellState[][]): number[][] {
  return board.map(row => row.map(cell => cell.value ?? 0));
}

function validateBoard(board: CellState[][], solution: number[][]): CellState[][] {
  return board.map((row, r) =>
    row.map((cell, c) => ({
      ...cell,
      pencilMarks: new Set(cell.pencilMarks),
      isError:
        cell.value !== null && !cell.isGiven && cell.value !== solution[r][c],
    }))
  );
}

function isBoardComplete(board: CellState[][], solution: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value !== solution[r][c]) return false;
    }
  }
  return true;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ────────────────────────────────────────────────────────────
// State 型
// ────────────────────────────────────────────────────────────

interface GameStore {
  // ── パズル状態
  board: CellState[][];
  solution: number[][];
  puzzle: number[][];
  difficulty: Difficulty;
  isComplete: boolean;
  isGenerating: boolean;

  // ── 選択・入力
  selectedCell: [number, number] | null;
  pencilMode: boolean;

  // ── タイマー
  timer: number;
  isTimerRunning: boolean;
  timerWasRunning: boolean; // ホーム移動直前の状態を保存

  // ── ヒント
  currentHint: StepLog | null;
  hintCount: number;

  // ── Undo / Redo
  history: CellState[][][];
  historyIndex: number;

  // ── 統計
  statistics: Statistics;

  // ── 画面
  screen: 'home' | 'game';

  // ── モーダル
  showStats: boolean;
  showDifficultyPicker: boolean;

  // ── アクション
  newGame: (difficulty: Difficulty) => void;
  goHome: () => void;
  selectCell: (row: number, col: number) => void;
  inputNumber: (num: number) => void;
  eraseCell: () => void;
  togglePencilMode: () => void;
  togglePencilMark: (num: number) => void;
  requestHint: () => void;
  clearHint: () => void;
  undo: () => void;
  redo: () => void;
  tick: () => void;
  toggleTimer: () => void;
  revealCell: () => void;
  resetPuzzle: () => void;
  setShowStats: (v: boolean) => void;
  setShowDifficultyPicker: (v: boolean) => void;
}

// ────────────────────────────────────────────────────────────
// Store 本体
// ────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // ── 初期値
      board: buildBoard(Array.from({ length: 9 }, () => Array(9).fill(0))),
      solution: Array.from({ length: 9 }, () => Array(9).fill(0)),
      puzzle: Array.from({ length: 9 }, () => Array(9).fill(0)),
      difficulty: 'intermediate',
      isComplete: false,
      isGenerating: false,
      screen: 'home' as const,
      selectedCell: null,
      pencilMode: false,
      timer: 0,
      isTimerRunning: false,
      timerWasRunning: false,
      currentHint: null,
      hintCount: 0,
      history: [],
      historyIndex: -1,
      statistics: { ...DEF_STATS },
      showStats: false,
      showDifficultyPicker: false,

      // ────────────────────────────────────────────────────
      // newGame
      // ────────────────────────────────────────────────────
      newGame: (difficulty) => {
        set({ isGenerating: true });

        // Web Worker があれば使いたいが、ここでは setTimeout で非同期化
        setTimeout(() => {
          const { puzzle, solution } = generatePuzzle(difficulty);
          const board = buildBoard(puzzle);

          set({
            board,
            solution,
            puzzle,
            difficulty,
            isComplete: false,
            isGenerating: false,
            screen: 'game',
            selectedCell: null,
            pencilMode: false,
            timer: 0,
            isTimerRunning: false,    // セルをタッチしたときに開始
            timerWasRunning: false,
            currentHint: null,
            hintCount: 0,
            history: [cloneBoard(board)],
            historyIndex: 0,
          });
        }, 0);
      },

      // ────────────────────────────────────────────────────
      // selectCell
      // ────────────────────────────────────────────────────
      selectCell: (row, col) => {
        const { isTimerRunning, isComplete } = get();
        // 初めてセルをタッチしたらタイマースタート
        const shouldStart = !isTimerRunning && !isComplete;
        set({
          selectedCell: [row, col],
          currentHint: null,
          ...(shouldStart ? { isTimerRunning: true } : {}),
        });
      },

      // ────────────────────────────────────────────────────
      // inputNumber
      // ────────────────────────────────────────────────────
      inputNumber: (num) => {
        const { selectedCell, board, solution, pencilMode, isComplete } = get();
        if (!selectedCell || isComplete) return;
        const [r, c] = selectedCell;
        if (board[r][c].isGiven) return;

        if (pencilMode) {
          get().togglePencilMark(num);
          return;
        }

        const newBoard = cloneBoard(board);

        // 同じ数字をもう一度入力したら消去
        if (newBoard[r][c].value === num) {
          newBoard[r][c].value = null;
          newBoard[r][c].isError = false;
        } else {
          newBoard[r][c].value = num;
          newBoard[r][c].pencilMarks.clear();
          newBoard[r][c].isError = num !== solution[r][c];

          // 同行・同列・同ボックスのペンシルマークから num を削除
          for (let i = 0; i < 9; i++) {
            newBoard[r][i].pencilMarks.delete(num);
            newBoard[i][c].pencilMarks.delete(num);
          }
          const br = Math.floor(r / 3) * 3;
          const bc = Math.floor(c / 3) * 3;
          for (let dr = 0; dr < 3; dr++) {
            for (let dc = 0; dc < 3; dc++) {
              newBoard[br + dr][bc + dc].pencilMarks.delete(num);
            }
          }
        }

        const validated = validateBoard(newBoard, solution);
        const complete = isBoardComplete(validated, solution);

        // 履歴に追加（redo履歴は破棄）
        const { history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(cloneBoard(validated));

        // ハプティック
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(complete ? [50, 30, 50] : 10);
        }

        // 完了時の統計更新
        if (complete) {
          const { statistics, timer, difficulty } = get();
          const today = formatDate(new Date());
          const isNewBest =
            statistics.bestTimes[difficulty] === null ||
            timer < (statistics.bestTimes[difficulty] ?? Infinity);

          const newStats: Statistics = {
            ...statistics,
            gamesPlayed: {
              ...statistics.gamesPlayed,
              [difficulty]: statistics.gamesPlayed[difficulty] + 1,
            },
            bestTimes: {
              ...statistics.bestTimes,
              [difficulty]: isNewBest ? timer : statistics.bestTimes[difficulty],
            },
            totalTimePlayed: statistics.totalTimePlayed + timer,
            currentStreak:
              statistics.lastPlayedDate === formatDate(new Date(Date.now() - 86400000)) ||
              statistics.lastPlayedDate === today
                ? statistics.currentStreak + 1
                : 1,
            maxStreak: Math.max(
              statistics.maxStreak,
              statistics.lastPlayedDate === formatDate(new Date(Date.now() - 86400000)) ||
              statistics.lastPlayedDate === today
                ? statistics.currentStreak + 1
                : 1
            ),
            lastPlayedDate: today,
          };

          set({
            board: validated,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            isComplete: true,
            isTimerRunning: false,
            statistics: newStats,
          });
        } else {
          set({
            board: validated,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          });
        }
      },

      // ────────────────────────────────────────────────────
      // eraseCell
      // ────────────────────────────────────────────────────
      eraseCell: () => {
        const { selectedCell, board } = get();
        if (!selectedCell) return;
        const [r, c] = selectedCell;
        if (board[r][c].isGiven) return;

        const newBoard = cloneBoard(board);
        newBoard[r][c].value = null;
        newBoard[r][c].pencilMarks.clear();
        newBoard[r][c].isError = false;

        const { history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(cloneBoard(newBoard));

        set({
          board: newBoard,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      // ────────────────────────────────────────────────────
      // togglePencilMode
      // ────────────────────────────────────────────────────
      togglePencilMode: () => {
        set(s => ({ pencilMode: !s.pencilMode }));
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(15);
        }
      },

      // ────────────────────────────────────────────────────
      // togglePencilMark
      // ────────────────────────────────────────────────────
      togglePencilMark: (num) => {
        const { selectedCell, board } = get();
        if (!selectedCell) return;
        const [r, c] = selectedCell;
        if (board[r][c].isGiven || board[r][c].value !== null) return;

        const newBoard = cloneBoard(board);
        const marks = newBoard[r][c].pencilMarks;
        if (marks.has(num)) {
          marks.delete(num);
        } else {
          marks.add(num);
        }

        const { history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(cloneBoard(newBoard));

        set({
          board: newBoard,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      // ────────────────────────────────────────────────────
      // requestHint
      // ────────────────────────────────────────────────────
      requestHint: () => {
        const { board } = get();
        const numBoard = boardToNumbers(board);
        const hint = getNextHint(numBoard);
        set(s => ({
          currentHint: hint,
          hintCount: s.hintCount + 1,
        }));
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([20, 10, 20]);
        }
      },

      clearHint: () => set({ currentHint: null }),

      // ────────────────────────────────────────────────────
      // undo / redo
      // ────────────────────────────────────────────────────
      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        set({
          board: cloneBoard(history[newIndex]),
          historyIndex: newIndex,
          isComplete: false,
        });
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;
        const newIndex = historyIndex + 1;
        set({
          board: cloneBoard(history[newIndex]),
          historyIndex: newIndex,
        });
      },

      // ────────────────────────────────────────────────────
      // tick (タイマー)
      // ────────────────────────────────────────────────────
      tick: () => {
        set(s => ({ timer: s.isTimerRunning ? s.timer + 1 : s.timer }));
      },

      toggleTimer: () => {
        const { isComplete } = get();
        if (isComplete) return;
        set(s => ({ isTimerRunning: !s.isTimerRunning }));
      },

      // ────────────────────────────────────────────────────
      // revealCell (選択セルを正解で埋める)
      // ────────────────────────────────────────────────────
      revealCell: () => {
        const { selectedCell, board, solution } = get();
        if (!selectedCell) return;
        const [r, c] = selectedCell;
        if (board[r][c].isGiven) return;

        const newBoard = cloneBoard(board);
        newBoard[r][c].value = solution[r][c];
        newBoard[r][c].isError = false;
        newBoard[r][c].pencilMarks.clear();

        const validated = validateBoard(newBoard, solution);
        const complete = isBoardComplete(validated, solution);

        const { history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(cloneBoard(validated));

        set({
          board: validated,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          isComplete: complete,
          isTimerRunning: !complete,
          currentHint: null,
          hintCount: get().hintCount + 1,
        });
      },

      // ────────────────────────────────────────────────────
      // resetPuzzle
      // ────────────────────────────────────────────────────
      resetPuzzle: () => {
        const { puzzle, solution } = get();
        const board = buildBoard(puzzle);
        set({
          board,
          isComplete: false,
          timer: 0,
          isTimerRunning: false,    // セルをタッチしたときに再開始
          timerWasRunning: false,
          currentHint: null,
          hintCount: 0,
          selectedCell: null,
          history: [cloneBoard(board)],
          historyIndex: 0,
        });
      },

      goHome: () => {
        const { isTimerRunning } = get();
        set({
          screen: 'home',
          timerWasRunning: isTimerRunning, // ホーム移動直前の状態を記録
          isTimerRunning: false,           // ホーム中はタイマー停止
          currentHint: null,
        });
      },

      setShowStats: (v) => set({ showStats: v }),
      setShowDifficultyPicker: (v) => set({ showDifficultyPicker: v }),
    }),
    {
      name: 'sudoku-pwa-storage',
      // Set は JSON でシリアライズできないためカスタムストレージで変換
      storage: {
        getItem: (name: string) => {
          try {
            if (typeof window === 'undefined') return null;
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            // pencilMarks を Array → Set に変換
            if (parsed?.state?.board) {
              parsed.state.board = parsed.state.board.map((row: any[]) =>
                row.map((cell: any) => ({
                  ...cell,
                  pencilMarks: new Set<number>(cell.pencilMarks ?? []),
                }))
              );
            }
            if (parsed?.state?.history) {
              parsed.state.history = parsed.state.history.map((snap: any[]) =>
                snap.map((row: any[]) =>
                  row.map((cell: any) => ({
                    ...cell,
                    pencilMarks: new Set<number>(cell.pencilMarks ?? []),
                  }))
                )
              );
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name: string, value: unknown) => {
          if (typeof window === 'undefined') return;
          // Set を Array に変換してシリアライズ
          const serialize = (v: unknown): unknown => {
            if (v instanceof Set) return [...v];
            if (Array.isArray(v)) return v.map(serialize);
            if (v && typeof v === 'object') {
              const out: Record<string, unknown> = {};
              for (const k of Object.keys(v)) out[k] = serialize((v as Record<string, unknown>)[k]);
              return out;
            }
            return v;
          };
          localStorage.setItem(name, JSON.stringify(serialize(value)));
        },
        removeItem: (name: string) => {
          if (typeof window !== 'undefined') localStorage.removeItem(name);
        },
      },
      partialize: (state: GameStore) => ({
        board: state.board,
        solution: state.solution,
        puzzle: state.puzzle,
        difficulty: state.difficulty,
        timer: state.timer,
        isTimerRunning: false, // 再開時はタイマー停止状態で復元
        hintCount: state.hintCount,
        history: state.history,
        historyIndex: state.historyIndex,
        statistics: state.statistics,
        isComplete: state.isComplete,
      }),
    } as any
  )
);
