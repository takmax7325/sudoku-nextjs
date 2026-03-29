// ============================================================
// Controls.tsx — コントロールパネル（ペンシル・Undo/Redo・リセット etc）
// ============================================================

'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { GAME_THEME } from '@/lib/theme';
import type { GameThemeTokens } from '@/lib/theme';
import type { Difficulty } from '@/lib/types';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/types';

export default function Controls() {
  const {
    pencilMode,
    togglePencilMode,
    undo,
    redo,
    eraseCell,
    historyIndex,
    history,
    difficulty,
    resetPuzzle,
    newGame,
    isGenerating,
    hintCount,
    setShowStats,
    setShowDifficultyPicker,
    theme,
  } = useGameStore();
  const gt = GAME_THEME[theme];

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 上段: Undo / Redo / ペンシル */}
      <div className="flex items-center justify-center gap-2">
        {/* Undo */}
        <ControlButton
          onClick={undo}
          disabled={!canUndo}
          label="戻る"
          icon={<UndoIcon />}
          gt={gt}
        />

        {/* Redo */}
        <ControlButton
          onClick={redo}
          disabled={!canRedo}
          label="進む"
          icon={<RedoIcon />}
          gt={gt}
        />

        {/* ペンシルモード */}
        <ControlButton
          onClick={togglePencilMode}
          active={pencilMode}
          label={pencilMode ? 'ペンON' : 'ペン'}
          icon={<PencilIcon />}
          activeColor="#7c3aed"
          gt={gt}
        />

        {/* リセット */}
        <ControlButton
          onClick={() => {
            if (confirm('このパズルをリセットしますか？')) resetPuzzle();
          }}
          label="リセット"
          icon={<ResetIcon />}
          gt={gt}
        />
      </div>

      {/* 下段: 新しいゲーム / 消去 / 統計 */}
      <div className="flex items-center justify-center gap-2">
        {/* 難易度 + 新規ゲーム */}
        <button
          onClick={() => setShowDifficultyPicker(true)}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold
            transition-all active:scale-95 hover:brightness-105 disabled:opacity-50"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #0f172a, #1e293b)'
              : `${DIFFICULTY_COLORS[difficulty]}10`,
            border: `1px solid ${DIFFICULTY_COLORS[difficulty]}60`,
            color: DIFFICULTY_COLORS[difficulty],
            fontSize: 'clamp(12px, 3vw, 14px)',
            transition: 'background 0.2s ease',
          }}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <SpinIcon />
              生成中...
            </span>
          ) : (
            <>
              <span>{DIFFICULTY_LABELS[difficulty]}</span>
              <span className="opacity-60">▼</span>
            </>
          )}
        </button>

        {/* 消去 */}
        <button
          onClick={eraseCell}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold
            transition-all active:scale-95 hover:brightness-105"
          style={{
            background: gt.actionBg,
            border: `1px solid ${gt.actionBorder}`,
            color: gt.actionText,
            fontSize: 'clamp(12px, 3vw, 14px)',
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
          aria-label="消去"
        >
          <EraseIcon />
          消去
        </button>

        {/* 統計 */}
        <button
          onClick={() => setShowStats(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold
            transition-all active:scale-95 hover:brightness-105"
          style={{
            background: gt.actionBg,
            border: `1px solid ${gt.actionBorder}`,
            color: gt.actionText,
            fontSize: 'clamp(12px, 3vw, 14px)',
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
        >
          <StatsIcon />
          統計
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 汎用ControlButton
// ────────────────────────────────────────────────────────────

interface ControlButtonProps {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  activeColor?: string;
  gt: GameThemeTokens;
}

function ControlButton({
  onClick,
  label,
  icon,
  disabled = false,
  active = false,
  activeColor = '#7dd3fc',
  gt,
}: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl
        transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed
        hover:brightness-105"
      style={{
        color: active ? activeColor : gt.controlText,
        background: active ? `${activeColor}15` : gt.controlBg,
        border: `1px solid ${active ? `${activeColor}40` : gt.controlBorder}`,
        minWidth: 'var(--control-min-w)',
        transition: 'background 0.2s ease, color 0.2s ease',
      }}
      aria-label={label}
    >
      {icon}
      <span style={{ fontSize: 'var(--control-font)' }}>{label}</span>
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// アイコン
// ────────────────────────────────────────────────────────────

function EraseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20H7L3 16l10-10 7 7-2.5 2.5" />
      <path d="M6.0001 17.0001L17 6" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SpinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// DifficultyPicker モーダル
// ────────────────────────────────────────────────────────────

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert', 'extreme'];

export function DifficultyPicker() {
  const { showDifficultyPicker, setShowDifficultyPicker, newGame, difficulty, theme } = useGameStore();
  const gt = GAME_THEME[theme];

  if (!showDifficultyPicker) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={() => setShowDifficultyPicker(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 animate-slide-up"
        style={{
          background: gt.modalBg,
          border: `1px solid ${gt.modalBorder}`,
          transition: 'background 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2
          className="text-lg font-bold mb-4 text-center"
          style={{ color: gt.modalTitleColor }}
        >
          難易度を選択
        </h2>

        <div className="flex flex-col gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => {
                newGame(d);
                setShowDifficultyPicker(false);
              }}
              className="flex items-center justify-between px-4 py-3 rounded-xl
                transition-all active:scale-98 hover:brightness-105"
              style={{
                background: d === difficulty ? `${DIFFICULTY_COLORS[d]}20` : gt.modalCardBg,
                border: `1px solid ${d === difficulty ? DIFFICULTY_COLORS[d] : gt.modalCardBorder}`,
              }}
            >
              <span className="font-bold" style={{ color: DIFFICULTY_COLORS[d] }}>
                {DIFFICULTY_LABELS[d]}
              </span>
              <DifficultyStars difficulty={d} />
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowDifficultyPicker(false)}
          className="mt-4 w-full py-2 rounded-xl text-sm
            transition-all hover:brightness-95"
          style={{ color: gt.modalCancelText }}
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

function DifficultyStars({ difficulty }: { difficulty: Difficulty }) {
  const stars = { beginner: 1, intermediate: 2, advanced: 3, expert: 4, extreme: 5 };
  const count = stars[difficulty];
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < count ? DIFFICULTY_COLORS[difficulty] : '#334155',
            fontSize: '14px',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
