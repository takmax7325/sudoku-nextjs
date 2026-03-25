// ============================================================
// types.ts — 全型定義
// ============================================================

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'extreme';

export type Technique =
  | 'Naked Single'
  | 'Hidden Single'
  | 'Naked Pair'
  | 'Naked Triple'
  | 'Pointing Pair'
  | 'X-Wing'
  | 'Swordfish'
  | 'XY-Wing';

/** 候補消去情報 */
export interface Elimination {
  row: number;
  col: number;
  values: number[];
}

/** 1ステップのログ */
export interface StepLog {
  technique: Technique;
  description: string;
  /** 手を置くセル or ハイライト対象セル */
  affectedCells: [number, number][];
  /** 数字を置く場合の値 */
  value?: number;
  /** 候補を消す場合の情報 */
  eliminations?: Elimination[];
}

/** solve() の戻り値 */
export interface SolveResult {
  board: number[][];
  steps: StepLog[];
  difficulty: Difficulty;
  solved: boolean;
  techniques: Technique[];
}

/** generate() の戻り値 */
export interface GenerateResult {
  puzzle: number[][];
  solution: number[][];
  difficulty: Difficulty;
}

/** UI セル状態 */
export interface CellState {
  value: number | null;
  /** ペンシルマーク（候補数字） */
  pencilMarks: Set<number>;
  isGiven: boolean;
  isError: boolean;
}

/** 統計情報 */
export interface Statistics {
  gamesPlayed: Record<Difficulty, number>;
  /** 難易度別ベストタイム (秒) */
  bestTimes: Record<Difficulty, number | null>;
  totalTimePlayed: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
}

export const DEFAULT_STATISTICS: Statistics = {
  gamesPlayed: {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0,
    extreme: 0,
  },
  bestTimes: {
    beginner: null,
    intermediate: null,
    advanced: null,
    expert: null,
    extreme: null,
  },
  totalTimePlayed: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayedDate: null,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
  expert: 'Expert',
  extreme: '鬼難問',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: '#4ade80',
  intermediate: '#60a5fa',
  advanced: '#f59e0b',
  expert: '#f97316',
  extreme: '#f43f5e',
};
