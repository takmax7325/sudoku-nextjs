// ============================================================
// theme.ts — ダーク / ライト テーマトークン
// ============================================================

export const GAME_THEME = {
  dark: {
    // ── 画面背景
    screenBg: '#0f172a',
    headerBg: 'rgba(15,23,42,0.95)',
    headerBorder: 'rgba(51,65,85,0.5)',
    headerIconColor: '#64748b',

    // ── グリッド
    gridBorder: '#ffffff',
    cellDefault: '#1e293b',
    cellSelected: '#1e3a8a',
    cellPeer: '#1e2d40',
    cellSameNumber: '#1d3461',
    cellHint: '#3b0764',
    cellBorderBold: 'rgba(255,255,255,1)',
    cellBorderLight: 'rgba(255,255,255,0.3)',
    cellTextGiven: '#f1f5f9',
    cellTextUser: '#7dd3fc',
    pencilMarkColor: '#94a3b8',

    // ── 数字パッド
    numPadBg: 'rgba(30,41,59,0.9)',
    numPadBorder: 'rgba(71,85,105,0.6)',
    numPadText: '#f1f5f9',
    numPadActiveBg: 'rgba(109,40,217,0.4)',

    // ── コントロールボタン
    controlBg: 'rgba(30,41,59,0.6)',
    controlBorder: 'rgba(71,85,105,0.3)',
    controlText: '#94a3b8',
    actionBg: 'rgba(30,41,59,0.8)',
    actionBorder: 'rgba(71,85,105,0.4)',
    actionText: '#94a3b8',

    // ── ヒントパネル
    hintPanelBg: 'rgba(15,23,42,0.95)',
    hintPanelText: '#cbd5e1',

    // ── モーダル共通
    modalBg: '#0f172a',
    modalBorder: '#334155',
    modalTitleColor: '#ffffff',
    modalTextColor: '#f1f5f9',
    modalSubTextColor: '#64748b',
    modalCardBg: 'rgba(30,41,59,0.6)',
    modalCardBorder: 'rgba(71,85,105,0.3)',
    modalCancelText: '#64748b',

    // ── タイマー
    timerIconColor: '#475569',
    timerSubText: '#f87171',
  },

  light: {
    // ── 画面背景
    screenBg: '#f0f4ff',
    headerBg: 'rgba(240,244,255,0.95)',
    headerBorder: 'rgba(203,213,225,0.8)',
    headerIconColor: '#94a3b8',

    // ── グリッド
    gridBorder: '#1e293b',
    cellDefault: '#ffffff',
    cellSelected: '#bfdbfe',
    cellPeer: '#f1f5f9',
    cellSameNumber: '#dbeafe',
    cellHint: '#ede9fe',
    cellBorderBold: 'rgba(30,41,59,1)',
    cellBorderLight: 'rgba(148,163,184,0.5)',
    cellTextGiven: '#1e293b',
    cellTextUser: '#2563eb',
    pencilMarkColor: '#94a3b8',

    // ── 数字パッド
    numPadBg: 'rgba(255,255,255,0.9)',
    numPadBorder: 'rgba(203,213,225,0.8)',
    numPadText: '#1e293b',
    numPadActiveBg: 'rgba(124,58,237,0.15)',

    // ── コントロールボタン
    controlBg: 'rgba(255,255,255,0.8)',
    controlBorder: 'rgba(203,213,225,0.6)',
    controlText: '#64748b',
    actionBg: 'rgba(255,255,255,0.9)',
    actionBorder: 'rgba(203,213,225,0.8)',
    actionText: '#64748b',

    // ── ヒントパネル
    hintPanelBg: 'rgba(255,255,255,0.95)',
    hintPanelText: '#475569',

    // ── モーダル共通
    modalBg: '#ffffff',
    modalBorder: '#e2e8f0',
    modalTitleColor: '#1e293b',
    modalTextColor: '#1e293b',
    modalSubTextColor: '#94a3b8',
    modalCardBg: 'rgba(248,250,252,0.8)',
    modalCardBorder: 'rgba(203,213,225,0.5)',
    modalCancelText: '#94a3b8',

    // ── タイマー
    timerIconColor: '#94a3b8',
    timerSubText: '#f87171',
  },
};

export type GameThemeKey = keyof typeof GAME_THEME;
export type GameThemeTokens = (typeof GAME_THEME)['dark'];
