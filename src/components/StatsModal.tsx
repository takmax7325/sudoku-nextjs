// ============================================================
// StatsModal.tsx — 統計モーダル
// ============================================================

'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/lib/types';
import type { Difficulty } from '@/lib/types';
import { formatTime } from '@/hooks/useGame';

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert', 'extreme'];

export default function StatsModal() {
  const { showStats, setShowStats, statistics } = useGameStore();

  if (!showStats) return null;

  const totalGames = Object.values(statistics.gamesPlayed).reduce((a, b) => a + b, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={() => setShowStats(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 animate-slide-up overflow-y-auto max-h-[90vh]"
        style={{ background: '#0f172a', border: '1px solid #334155' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">📊 統計</h2>
          <button
            onClick={() => setShowStats(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
            aria-label="Close stats"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard
            label="総プレイ"
            value={totalGames.toString()}
            unit="回"
            color="#60a5fa"
          />
          <StatCard
            label="連続クリア"
            value={statistics.currentStreak.toString()}
            unit="日"
            color="#4ade80"
          />
          <StatCard
            label="最大連続"
            value={statistics.maxStreak.toString()}
            unit="日"
            color="#f59e0b"
          />
        </div>

        {/* 総プレイ時間 */}
        <div
          className="rounded-xl p-3 mb-4 flex items-center justify-between"
          style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(71,85,105,0.3)' }}
        >
          <span className="text-slate-400 text-sm">総プレイ時間</span>
          <span className="font-bold text-white font-mono">
            {formatTime(statistics.totalTimePlayed)}
          </span>
        </div>

        {/* 難易度別詳細 */}
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
          難易度別詳細
        </h3>

        <div className="flex flex-col gap-2">
          {DIFFICULTIES.map(d => {
            const played = statistics.gamesPlayed[d];
            const best = statistics.bestTimes[d];
            const color = DIFFICULTY_COLORS[d];

            return (
              <div
                key={d}
                className="rounded-xl p-3"
                style={{
                  background: played > 0 ? `${color}10` : 'rgba(30,41,59,0.4)',
                  border: `1px solid ${played > 0 ? `${color}30` : 'rgba(71,85,105,0.2)'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm" style={{ color }}>
                    {DIFFICULTY_LABELS[d]}
                  </span>
                  <span className="text-white font-bold text-sm">
                    {played > 0 ? `${played}回` : '—'}
                  </span>
                </div>
                {best !== null && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">ベストタイム</span>
                    <span className="text-xs font-mono text-slate-300">
                      {formatTime(best)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {totalGames === 0 && (
          <p className="text-center text-slate-500 text-sm mt-4">
            まだゲームをプレイしていません。
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}25`,
      }}
    >
      <div
        className="text-2xl font-extrabold leading-none mb-1"
        style={{ color }}
      >
        {value}
      </div>
      <div className="text-xs text-slate-500">{unit}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}
