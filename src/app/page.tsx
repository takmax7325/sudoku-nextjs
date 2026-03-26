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
import { GAME_THEME } from '@/lib/theme';

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

// ────────────────────────────────────────────────────────────
// テーマ定義
// ────────────────────────────────────────────────────────────

const THEME = {
  dark: {
    bg: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)',
    titleColor: '#ffffff',
    titleShadow: '0 0 40px rgba(125,211,252,0.3)',
    labelColor: '#64748b',
    cardBg: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(30,41,59,0.6))',
    cardTextColor: '#ffffff',
    cardDescColor: '#64748b',
    cardStarEmpty: '#1e293b',
    actionCardBg: 'rgba(30,41,59,0.8)',
    actionBorder: 'rgba(71,85,105,0.5)',
    actionTextColor: '#94a3b8',
    continueTextColor: '#7dd3fc',
    spinnerColor: '#94a3b8',
    themeButtonBg: 'rgba(30,41,59,0.8)',
    themeButtonBorder: 'rgba(71,85,105,0.5)',
    themeButtonColor: '#94a3b8',
  },
  light: {
    bg: 'linear-gradient(160deg, #f0f4ff 0%, #e8eeff 100%)',
    titleColor: '#1e293b',
    titleShadow: '0 0 40px rgba(99,102,241,0.15)',
    labelColor: '#94a3b8',
    cardBg: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,255,0.8))',
    cardTextColor: '#1e293b',
    cardDescColor: '#94a3b8',
    cardStarEmpty: '#e2e8f0',
    actionCardBg: 'rgba(255,255,255,0.9)',
    actionBorder: 'rgba(203,213,225,0.8)',
    actionTextColor: '#64748b',
    continueTextColor: '#4f46e5',
    spinnerColor: '#64748b',
    themeButtonBg: 'rgba(255,255,255,0.9)',
    themeButtonBorder: 'rgba(203,213,225,0.8)',
    themeButtonColor: '#64748b',
  },
} as const;

function HomeScreen() {
  const { newGame, isGenerating, setShowStats, puzzle, timerWasRunning, difficulty, theme, toggleTheme } = useGameStore();

  // ゲーム途中かどうか（全空白でなければ継続可能）
  const hasSavedGame = puzzle.some(row => row.some(v => v !== 0));
  const t = THEME[theme];

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-4 pb-8 animate-fade-in"
      style={{ background: t.bg, transition: 'background 0.3s ease' }}
    >
      {/* テーマ切替ボタン（右上） */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95 hover:brightness-110"
          style={{
            background: t.themeButtonBg,
            border: `1px solid ${t.themeButtonBorder}`,
            color: t.themeButtonColor,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          aria-label={theme === 'dark' ? 'ライトモードに切替' : 'ダークモードに切替'}
        >
          {theme === 'dark' ? (
            /* 太陽アイコン */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            /* 月アイコン */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* 難易度選択 */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-6">
        {/* タイトル：難易度セクションの直上 */}
        <div className="flex flex-col items-center mb-3">
          <h1
            className="font-extrabold tracking-tight"
            style={{
              fontSize: 'clamp(36px, 10vw, 56px)',
              color: t.titleColor,
              textShadow: t.titleShadow,
              transition: 'color 0.3s ease',
            }}
          >
            ナンプレ
          </h1>
        </div>
        <p
          className="text-xs font-semibold uppercase tracking-widest text-center mb-1"
          style={{ color: t.labelColor, transition: 'color 0.3s ease' }}
        >
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
                background: t.cardBg,
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
                  <div className="font-bold" style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: t.cardTextColor }}>
                    {DIFFICULTY_LABELS[d]}
                  </div>
                  <div className="truncate" style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: t.cardDescColor }}>
                    {DIFFICULTY_DESC[d]}
                  </div>
                </div>
              </div>

              {/* 右: スター */}
              <div className="flex gap-0.5 flex-shrink-0">
                {Array.from({ length: 5 }).map((_, si) => (
                  <span
                    key={si}
                    style={{ color: si < stars ? color : t.cardStarEmpty, fontSize: '14px' }}
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
        <div
          className="flex items-center gap-2 mb-4 text-sm animate-fade-in"
          style={{ color: t.spinnerColor }}
        >
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
              background: t.actionCardBg,
              border: `1px solid ${DIFFICULTY_COLORS[difficulty]}50`,
              color: t.continueTextColor,
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
            background: t.actionCardBg,
            border: `1px solid ${t.actionBorder}`,
            color: t.actionTextColor,
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
  const { difficulty, isGenerating, goHome, theme, toggleTheme } = useGameStore();
  const gt = GAME_THEME[theme];

  const getCellHighlight = useCallback(
    (row: number, col: number) => game.getCellHighlight(row, col),
    [game.getCellHighlight]
  );

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start overflow-x-hidden pb-8"
      style={{ background: gt.screenBg, transition: 'background 0.3s ease' }}
    >
      {/* ヘッダー */}
      <header
        className="w-full flex items-center justify-start py-3 px-4"
        style={{
          borderBottom: `1px solid ${gt.headerBorder}`,
          background: gt.headerBg,
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* ホームに戻るボタン */}
        <button
          onClick={goHome}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg
            transition-all hover:bg-black/5 active:scale-95"
          style={{ color: gt.headerIconColor }}
          aria-label="ホームに戻る"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>

        {/* テーマ切替ボタン（右端） */}
        <button
          onClick={toggleTheme}
          className="ml-auto flex items-center justify-center w-9 h-9 rounded-full
            transition-all active:scale-95 hover:brightness-110"
          style={{
            background: gt.controlBg,
            border: `1px solid ${gt.controlBorder}`,
            color: gt.headerIconColor,
          }}
          aria-label={theme === 'dark' ? 'ライトモードに切替' : 'ダークモードに切替'}
        >
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
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
            style={{ background: gt.numPadBg, border: `1px solid ${gt.modalBorder}` }}
          >
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={gt.cellTextUser} strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span className="text-sm" style={{ color: gt.hintPanelText }}>パズルを生成中...</span>
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
