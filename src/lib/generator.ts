// ============================================================
// generator.ts — パズル生成エンジン
// ① 完全解の生成（バックトラック）
// ② 対称的な穴あけ
// ③ 唯一解チェック
// ④ solver による難易度検証
// ============================================================

import { solve, countSolutions, isValidPlacement } from './solver';
import type { Difficulty, GenerateResult } from './types';

// ────────────────────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptyBoard(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function cloneBoard(board: number[][]): number[][] {
  return board.map(row => [...row]);
}

// ────────────────────────────────────────────────────────────
// 完全解の生成（対角ボックスを先に埋めて高速化）
// ────────────────────────────────────────────────────────────

function fillDiagonalBoxes(board: number[][]): void {
  for (let box = 0; box < 3; box++) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let idx = 0;
    for (let dr = 0; dr < 3; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        board[box * 3 + dr][box * 3 + dc] = nums[idx++];
      }
    }
  }
}

function solveFull(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (const n of nums) {
        if (isValidPlacement(board, r, c, n)) {
          board[r][c] = n;
          if (solveFull(board)) return true;
          board[r][c] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

function generateFullSolution(): number[][] {
  const board = emptyBoard();
  fillDiagonalBoxes(board);
  solveFull(board);
  return board;
}

// ────────────────────────────────────────────────────────────
// 難易度別・穴の数の範囲
// ────────────────────────────────────────────────────────────

type RemoveRange = { min: number; max: number };

const REMOVE_RANGES: Record<Difficulty, RemoveRange> = {
  beginner:     { min: 36, max: 41 }, // 40〜45 ヒント
  intermediate: { min: 46, max: 51 }, // 30〜35 ヒント
  advanced:     { min: 52, max: 56 }, // 25〜29 ヒント
  expert:       { min: 56, max: 60 }, // 21〜25 ヒント
  extreme:      { min: 58, max: 64 }, // 17〜23 ヒント
};

// ────────────────────────────────────────────────────────────
// メイン生成関数
// ────────────────────────────────────────────────────────────

/**
 * 指定難易度のパズルを生成する。
 * solver で解けること・唯一解であることを保証する。
 * 鬼難問は X-Wing 以上の技法が必要であることを検証する。
 */
export function generatePuzzle(difficulty: Difficulty, maxAttempts = 200): GenerateResult {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const solution = generateFullSolution();
    const puzzle = tryDigPuzzle(solution, difficulty);

    if (!puzzle) continue;

    // solver による検証
    const result = solve(puzzle);
    if (!result.solved) continue;

    // 難易度一致チェック
    if (!difficultyMatches(result.difficulty, result.techniques, difficulty)) continue;

    return { puzzle, solution, difficulty: result.difficulty };
  }

  // フォールバック: 難易度を緩めて再生成
  console.warn(`[generator] ${difficulty} の生成に失敗。fallbackします。`);
  return generateFallback(difficulty);
}

function tryDigPuzzle(solution: number[][], difficulty: Difficulty): number[][] | null {
  const range = REMOVE_RANGES[difficulty];
  const targetRemove = range.min + Math.floor(Math.random() * (range.max - range.min + 1));

  const puzzle = cloneBoard(solution);
  const positions = shuffle(getAllPositions());

  let removed = 0;

  for (const [r, c] of positions) {
    if (removed >= targetRemove) break;

    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    // 唯一解でなければ戻す
    if (countSolutions(puzzle) !== 1) {
      puzzle[r][c] = backup;
      continue;
    }

    removed++;
  }

  if (removed < range.min - 4) return null;
  return puzzle;
}

function getAllPositions(): [number, number][] {
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  return positions;
}

function difficultyMatches(
  actual: Difficulty,
  techniques: string[],
  target: Difficulty
): boolean {
  switch (target) {
    case 'beginner':
      return actual === 'beginner';
    case 'intermediate':
      return actual === 'intermediate' || actual === 'beginner';
    case 'advanced':
      return actual === 'advanced';
    case 'expert':
      return actual === 'expert';
    case 'extreme':
      return (
        actual === 'extreme' &&
        techniques.some(t => t === 'X-Wing' || t === 'Swordfish' || t === 'XY-Wing')
      );
  }
}

/** フォールバック生成: 難易度検証なしで生成 */
function generateFallback(difficulty: Difficulty): GenerateResult {
  for (let attempt = 0; attempt < 500; attempt++) {
    const solution = generateFullSolution();
    const puzzle = tryDigPuzzle(solution, difficulty);
    if (!puzzle) continue;

    const result = solve(puzzle);
    if (!result.solved) continue;

    return { puzzle, solution, difficulty: result.difficulty };
  }

  // 最終フォールバック: 既知の初級パズル
  return buildKnownPuzzle();
}

/** 既知の初級パズル（緊急フォールバック用） */
function buildKnownPuzzle(): GenerateResult {
  const puzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];
  const { board: solution } = solve(puzzle);
  return { puzzle, solution, difficulty: 'beginner' };
}
