// ============================================================
// page.tsx — ホーム画面 & ゲーム画面
// ============================================================

'use client';

import React, { useCallback } from 'react';
import { useGame } from '@/hooks/useGame';
import { useGameStore } from '@/store/gameStore';
import SudokuGrid from '@/components/SudokuGrid';
import NumberPad from '@/components/NumberPad';
import HintPanel from '@/components/HintPanel';
import Timer from '@/components/Timer';
import Controls, { DifficultyPicker } from '@/components/Controls';
import StatsModal from '@/components/StatsModal';
import ClearOverlay from '@/components/ClearOverlay';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/types';
import type { Difficulty } from '@/lib/types';

export default function HomePage() {
  const { screen } = useGameStore();

  return screen === 'home' ? <HomeScreen /> : <GameScreen />;
}

// ============================================================
// ホーム画面
// ============================================================

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert', 'extreme'];

const DIFFICULTY_DESC: Record<Difficulty, string> = {
  beginner:     'Naked Single のみ。初めての方に。',
  intermediate: 'Hidden Single まで。少し考えます。',
  advanced:     'Naked Pair / Pointing Pair を使用。',
  expert:       'X-Wing が必要な本格派。',
  extreme:      'Swordfish / XY-Wing 必須。鬼レベル。',
};

const DIFFICULTY_STARS: Record<Difficulty, number> = {
  beginner: 1, intermediate: 2, advanced: 3, expert: 4, extreme: 5,
};

function HomeScreen() {
  const { newGame, isGenerating, statistics, setShowStats, puzzle, timerWasRunning, difficulty } = useGameStore();

  // ゲーム途中かどうか（全空白でなければ継続可能）
  const hasSavedGame = puzzle.some(row => row.some(v => v !== 0));

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 pb-8 animate-fade-in"
      style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)' }}
    >
      {/* 難易度選択 */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-6">
        {/* タイトル：難易度セクションの直上 */}
        <div className="flex flex-col items-center mb-3">
          <h1
            className="font-extrabold tracking-tight text-white"
            style={{ fontSize: 'clamp(36px, 10vw, 56px)', textShadow: '0 0 40px rgba(125,211,252,0.3)' }}
          >
            数独
          </h1>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-center mb-1">
          難易度を選んでスタート
        </p>

        {DIFFICULTIES.map((d, i) => {
          const color = DIFFICULTY_COLORS[d];
          const stars = DIFFICULTY_STARS[d];
          return (
            <button
              key={d}
              onClick={() => newGame(d)}
              disabled={isGenerating}
              className="group relative w-full flex items-center gap-4 px-5 py-4 rounded-2xl
                transition-all duration-200 active:scale-97 hover:scale-101
                disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up"
              style={{
                background: `linear-gradient(135deg, rgba(30,41,59,0.9), rgba(30,41,59,0.6))`,
                border: `1px solid ${color}40`,
                boxShadow: `0 4px 24px ${color}10`,
                animationDelay: `${i * 60}ms`,
                animationFillMode: 'both',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${color}90`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 32px ${color}30`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${color}10`;
              }}
            >
              {/* 左: カラードット + 難易度名 */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />
                <div className="text-left min-w-0">
                  <div className="font-bold text-white" style={{ fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
                    {DIFFICULTY_LABELS[d]}
                  </div>
                  <div className="text-slate-500 truncate" style={{ fontSize: 'clamp(10px, 2.5vw, 12px)' }}>
                    {DIFFICULTY_DESC[d]}
                  </div>
                </div>
              </div>

              {/* 右: スター */}
              <div className="flex gap-0.5 flex-shrink-0">
                {Array.from({ length: 5 }).map((_, si) => (
                  <span
                    key={si}
                    style={{ color: si < stars ? color : '#1e293b', fontSize: '14px' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* 生成中インジケーター */}
      {isGenerating && (
        <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm animate-fade-in">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          パズルを生成中...
        </div>
      )}

      {/* 継続 / 統計ボタン */}
      <div className="flex gap-3 w-full max-w-sm">
        {hasSavedGame && (
          <button
            onClick={() => useGameStore.setState({ screen: 'game', isTimerRunning: timerWasRunning })}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
              font-semibold transition-all active:scale-95 hover:brightness-110"
            style={{
              background: 'rgba(30,41,59,0.8)',
              border: `1px solid ${DIFFICULTY_COLORS[difficulty]}50`,
              color: '#7dd3fc',
              fontSize: 'clamp(12px, 3vw, 14px)',
            }}
          >
            {/* 難易度カラーボール */}
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: DIFFICULTY_COLORS[difficulty],
                boxShadow: `0 0 6px ${DIFFICULTY_COLORS[difficulty]}`,
                flexShrink: 0,
              }}
            />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            続きから
          </button>
        )}

        <button
          onClick={() => setShowStats(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
            font-semibold transition-all active:scale-95 hover:brightness-110"
          style={{
            background: 'rgba(30,41,59,0.8)',
            border: '1px solid rgba(71,85,105,0.5)',
            color: '#94a3b8',
            fontSize: 'clamp(12px, 3vw, 14px)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          統計
        </button>
      </div>

      <StatsModal />
    </main>
  );
}

// ============================================================
// ゲーム画面
// ============================================================

function GameScreen() {
  const game = useGame();
  const { difficulty, isGenerating, goHome } = useGameStore();

  const getCellHighlight = useCallback(
    (row: number, col: number) => game.getCellHighlight(row, col),
    [game.getCellHighlight]
  );

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start overflow-x-hidden pb-8"
      style={{ background: '#0f172a' }}
    >
      {/* ヘッダー */}
      <header
        className="w-full flex items-center justify-start py-3 px-4"
        style={{
          borderBottom: '1px solid rgba(51,65,85,0.5)',
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* ホームに戻るボタン */}
        <button
          onClick={goHome}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg
            transition-all hover:bg-white/10 active:scale-95"
          style={{ color: '#64748b' }}
          aria-label="ホームに戻る"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
      </header>

      {/* コンテンツ */}
      <div className="w-full max-w-lg px-3 flex flex-col items-center gap-4 mt-3">

        {/* 難易度バッジ + タイマー（同一行・タイマー中央） */}
        <div className="w-full relative flex items-center px-1">
          <DifficultyBadge difficulty={difficulty} />
          <div className="absolute left-1/2 -translate-x-1/2">
            <Timer />
          </div>
        </div>

        {/* 生成ローディング */}
        {isGenerating && (
          <div
            className="w-full rounded-xl p-4 flex items-center justify-center gap-3 animate-fade-in"
            style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid #334155' }}
          >
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span className="text-slate-300 text-sm">パズルを生成中...</span>
          </div>
        )}

        {/* グリッド */}
        <div className="sudoku-grid-wrapper">
          <SudokuGrid getCellHighlight={getCellHighlight} />
        </div>

        {/* ヒントパネル */}
        <div className="w-full">
          <HintPanel />
        </div>

        {/* 数字パッド */}
        <NumberPad />

        {/* コントロール */}
        <Controls />
      </div>

      {/* モーダル */}
      <DifficultyPicker />
      <StatsModal />

      {/* クリア祝福オーバーレイ */}
      <ClearOverlay />
    </main>
  );
}

// ────────────────────────────────────────────────────────────
// 難易度バッジ
// ────────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const color = DIFFICULTY_COLORS[difficulty];
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 rounded-full"
      style={{ background: `${color}15`, border: `1px solid ${color}40` }}
    >
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="font-bold text-xs tracking-wide" style={{ color }}>
        {DIFFICULTY_LABELS[difficulty]}
      </span>
    </div>
  );
}
