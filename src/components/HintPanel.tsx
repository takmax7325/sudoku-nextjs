// ============================================================
// HintPanel.tsx — ヒント表示パネル
// ============================================================

'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { GAME_THEME } from '@/lib/theme';
import type { Technique } from '@/lib/types';

const TECHNIQUE_COLORS: Record<Technique, string> = {
  'Naked Single':  '#4ade80',
  'Hidden Single': '#60a5fa',
  'Naked Pair':    '#f59e0b',
  'Naked Triple':  '#fb923c',
  'Pointing Pair': '#a78bfa',
  'X-Wing':        '#f43f5e',
  'Swordfish':     '#ec4899',
  'XY-Wing':       '#ff6b6b',
};

const TECHNIQUE_LEVEL: Record<Technique, string> = {
  'Naked Single':  'Lv.1',
  'Hidden Single': 'Lv.2',
  'Naked Pair':    'Lv.3',
  'Naked Triple':  'Lv.4',
  'Pointing Pair': 'Lv.5',
  'X-Wing':        'Lv.6',
  'Swordfish':     'Lv.7',
  'XY-Wing':       'Lv.7',
};

export default function HintPanel() {
  const { currentHint, clearHint, requestHint, hintCount, isComplete, isGenerating, theme } = useGameStore();
  const gt = GAME_THEME[theme];

  return (
    <div className="w-full">
      {currentHint ? (
        <div
          className="w-full rounded-xl p-4 animate-fade-in"
          style={{
            background: gt.hintPanelBg,
            border: `1px solid ${TECHNIQUE_COLORS[currentHint.technique] ?? '#7c3aed'}40`,
            boxShadow: `0 0 20px ${TECHNIQUE_COLORS[currentHint.technique] ?? '#7c3aed'}20`,
            transition: 'background 0.3s ease',
          }}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: `${TECHNIQUE_COLORS[currentHint.technique] ?? '#7c3aed'}30`,
                  color: TECHNIQUE_COLORS[currentHint.technique] ?? '#7c3aed',
                  border: `1px solid ${TECHNIQUE_COLORS[currentHint.technique] ?? '#7c3aed'}50`,
                }}
              >
                {TECHNIQUE_LEVEL[currentHint.technique]}
              </span>
              <span
                className="font-bold"
                style={{
                  color: TECHNIQUE_COLORS[currentHint.technique] ?? '#a78bfa',
                  fontSize: 'clamp(16px, 4vw, 20px)',
                }}
              >
                {currentHint.technique}
              </span>
            </div>

            <button
              onClick={clearHint}
              className="p-1 rounded-lg transition-all hover:bg-black/10 active:scale-90"
              aria-label="Close hint"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={gt.modalSubTextColor}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* 説明文 */}
          <p
            className="leading-relaxed"
            style={{ color: gt.hintPanelText, fontSize: 'clamp(14px, 3.5vw, 17px)' }}
          >
            {currentHint.description}
          </p>

          {/* 対象セル表示 */}
          <div className="mt-3 flex flex-wrap gap-1">
            {currentHint.value !== undefined && (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                style={{
                  background: 'rgba(74,222,128,0.15)',
                  color: '#4ade80',
                  border: '1px solid rgba(74,222,128,0.3)',
                }}
              >
                ✓ 数字 {currentHint.value} を配置
              </span>
            )}
            {currentHint.eliminations && currentHint.eliminations.length > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                style={{
                  background: 'rgba(251,146,60,0.15)',
                  color: '#fb923c',
                  border: '1px solid rgba(251,146,60,0.3)',
                }}
              >
                ✂ {currentHint.eliminations.length} 箇所の候補を除去
              </span>
            )}
          </div>

          {/* 次の手を適用ボタン */}
          {currentHint.value !== undefined && (
            <button
              onClick={() => {
                const { clearHint, revealCell, selectCell } = useGameStore.getState();
                const [r, c] = currentHint.affectedCells[0];
                selectCell(r, c);
                revealCell();
                clearHint();
              }}
              className="mt-3 w-full py-2 rounded-lg text-xs font-semibold
                transition-all hover:brightness-110 active:scale-95"
              style={{
                background: 'rgba(74,222,128,0.15)',
                color: '#4ade80',
                border: '1px solid rgba(74,222,128,0.3)',
              }}
            >
              このセルを自動入力
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function LightbulbIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21h6M12 3a7 7 0 0 1 4.47 12.5c-.58.56-1.47 1.5-1.47 2.5H9c0-1-.89-1.94-1.47-2.5A7 7 0 0 1 12 3z" />
    </svg>
  );
}
