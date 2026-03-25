// ============================================================
// solver.ts — 純ロジック解法エンジン（総当たり禁止）
// 対応技法: Naked Single / Hidden Single / Naked Pair / Naked Triple
//           Pointing Pair / X-Wing / Swordfish / XY-Wing
// ============================================================

import type { Technique, StepLog, SolveResult, Difficulty, Elimination } from './types';

type Candidates = Set<number>[][];

// ────────────────────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────────────────────

function cloneBoard(board: number[][]): number[][] {
  return board.map(row => [...row]);
}

function cloneCandidates(cands: Candidates): Candidates {
  return cands.map(row => row.map(cell => new Set(cell)));
}

/** ボードから各空セルの候補集合を全計算 */
function computeCandidates(board: number[][]): Candidates {
  const cands: Candidates = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set<number>())
  );

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;

      const used = new Set<number>();

      // 行
      for (let i = 0; i < 9; i++) {
        if (board[r][i] !== 0) used.add(board[r][i]);
        if (board[i][c] !== 0) used.add(board[i][c]);
      }

      // ボックス
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          const v = board[br + dr][bc + dc];
          if (v !== 0) used.add(v);
        }
      }

      for (let n = 1; n <= 9; n++) {
        if (!used.has(n)) cands[r][c].add(n);
      }
    }
  }

  return cands;
}

/** 2つのSetが等しいか */
function setsEqual(a: Set<number>, b: Set<number>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

/** 2セルが同一ユニット（行・列・ボックス）を共有するか */
function seesEachOther(r1: number, c1: number, r2: number, c2: number): boolean {
  if (r1 === r2 && c1 === c2) return false;
  return (
    r1 === r2 ||
    c1 === c2 ||
    (Math.floor(r1 / 3) === Math.floor(r2 / 3) &&
      Math.floor(c1 / 3) === Math.floor(c2 / 3))
  );
}

/** 全ユニット（行×9 + 列×9 + ボックス×9）を返す */
function getUnits(): [number, number][][] {
  const units: [number, number][][] = [];

  for (let r = 0; r < 9; r++) {
    const unit: [number, number][] = [];
    for (let c = 0; c < 9; c++) unit.push([r, c]);
    units.push(unit);
  }

  for (let c = 0; c < 9; c++) {
    const unit: [number, number][] = [];
    for (let r = 0; r < 9; r++) unit.push([r, c]);
    units.push(unit);
  }

  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const unit: [number, number][] = [];
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          unit.push([br * 3 + dr, bc * 3 + dc]);
        }
      }
      units.push(unit);
    }
  }

  return units;
}

// ────────────────────────────────────────────────────────────
// 技法① Naked Single
// ────────────────────────────────────────────────────────────
function nakedSingle(board: number[][], cands: Candidates): StepLog | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue;
      if (cands[r][c].size === 1) {
        const value = [...cands[r][c]][0];
        return {
          technique: 'Naked Single',
          description: `セル(${r + 1}行${c + 1}列) には ${value} しか入りません。行・列・ボックスで他の数字はすべて使用済みです。`,
          affectedCells: [[r, c]],
          value,
        };
      }
    }
  }
  return null;
}

// ────────────────────────────────────────────────────────────
// 技法② Hidden Single
// ────────────────────────────────────────────────────────────
function hiddenSingle(board: number[][], cands: Candidates): StepLog | null {
  // 行チェック
  for (let r = 0; r < 9; r++) {
    for (let n = 1; n <= 9; n++) {
      const cells: [number, number][] = [];
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0 && cands[r][c].has(n)) cells.push([r, c]);
      }
      if (cells.length === 1) {
        const [row, col] = cells[0];
        return {
          technique: 'Hidden Single',
          description: `${n} は第${r + 1}行の中で (${row + 1}行${col + 1}列) にしか入れません（Hidden Single）。`,
          affectedCells: cells,
          value: n,
        };
      }
    }
  }

  // 列チェック
  for (let c = 0; c < 9; c++) {
    for (let n = 1; n <= 9; n++) {
      const cells: [number, number][] = [];
      for (let r = 0; r < 9; r++) {
        if (board[r][c] === 0 && cands[r][c].has(n)) cells.push([r, c]);
      }
      if (cells.length === 1) {
        const [row, col] = cells[0];
        return {
          technique: 'Hidden Single',
          description: `${n} は第${c + 1}列の中で (${row + 1}行${col + 1}列) にしか入れません（Hidden Single）。`,
          affectedCells: cells,
          value: n,
        };
      }
    }
  }

  // ボックスチェック
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      for (let n = 1; n <= 9; n++) {
        const cells: [number, number][] = [];
        for (let dr = 0; dr < 3; dr++) {
          for (let dc = 0; dc < 3; dc++) {
            const r = br * 3 + dr;
            const c = bc * 3 + dc;
            if (board[r][c] === 0 && cands[r][c].has(n)) cells.push([r, c]);
          }
        }
        if (cells.length === 1) {
          const [row, col] = cells[0];
          return {
            technique: 'Hidden Single',
            description: `${n} はボックス(${br + 1},${bc + 1})内で (${row + 1}行${col + 1}列) にしか入れません（Hidden Single）。`,
            affectedCells: cells,
            value: n,
          };
        }
      }
    }
  }

  return null;
}

// ────────────────────────────────────────────────────────────
// 技法③ Naked Pair
// ────────────────────────────────────────────────────────────
function nakedPair(cands: Candidates): StepLog | null {
  const units = getUnits();

  for (const unit of units) {
    const twos = unit.filter(([r, c]) => cands[r][c].size === 2);

    for (let i = 0; i < twos.length; i++) {
      for (let j = i + 1; j < twos.length; j++) {
        const [r1, c1] = twos[i];
        const [r2, c2] = twos[j];

        if (!setsEqual(cands[r1][c1], cands[r2][c2])) continue;

        const pair = [...cands[r1][c1]];
        const eliminations: Elimination[] = [];

        for (const [r, c] of unit) {
          if ((r === r1 && c === c1) || (r === r2 && c === c2)) continue;
          const toElim = pair.filter(n => cands[r][c].has(n));
          if (toElim.length > 0) eliminations.push({ row: r, col: c, values: toElim });
        }

        if (eliminations.length > 0) {
          return {
            technique: 'Naked Pair',
            description: `(${r1 + 1}行${c1 + 1}列) と (${r2 + 1}行${c2 + 1}列) は [${pair.join(', ')}] のNaked Pairです。同ユニット内の他のセルからこれらの候補を除去できます。`,
            affectedCells: [[r1, c1], [r2, c2], ...eliminations.map(e => [e.row, e.col] as [number, number])],
            eliminations,
          };
        }
      }
    }
  }

  return null;
}

// ────────────────────────────────────────────────────────────
// 技法④ Naked Triple
// ────────────────────────────────────────────────────────────
function nakedTriple(cands: Candidates): StepLog | null {
  const units = getUnits();

  for (const unit of units) {
    const candidates23 = unit.filter(([r, c]) => cands[r][c].size >= 2 && cands[r][c].size <= 3);

    for (let i = 0; i < candidates23.length; i++) {
      for (let j = i + 1; j < candidates23.length; j++) {
        for (let k = j + 1; k < candidates23.length; k++) {
          const [r1, c1] = candidates23[i];
          const [r2, c2] = candidates23[j];
          const [r3, c3] = candidates23[k];

          const union = new Set([
            ...cands[r1][c1],
            ...cands[r2][c2],
            ...cands[r3][c3],
          ]);

          if (union.size !== 3) continue;

          const triple = [...union];
          const eliminations: Elimination[] = [];

          for (const [r, c] of unit) {
            if (
              (r === r1 && c === c1) ||
              (r === r2 && c === c2) ||
              (r === r3 && c === c3)
            )
              continue;
            const toElim = triple.filter(n => cands[r][c].has(n));
            if (toElim.length > 0) eliminations.push({ row: r, col: c, values: toElim });
          }

          if (eliminations.length > 0) {
            return {
              technique: 'Naked Triple',
              description: `(${r1 + 1}行${c1 + 1}列), (${r2 + 1}行${c2 + 1}列), (${r3 + 1}行${c3 + 1}列) は [${triple.join(', ')}] のNaked Tripleです。同ユニット内の他のセルからこれらを除去できます。`,
              affectedCells: [
                [r1, c1], [r2, c2], [r3, c3],
                ...eliminations.map(e => [e.row, e.col] as [number, number]),
              ],
              eliminations,
            };
          }
        }
      }
    }
  }

  return null;
}

// ────────────────────────────────────────────────────────────
// 技法⑤ Pointing Pair / Pointing Triple
// ────────────────────────────────────────────────────────────
function pointingPair(cands: Candidates): StepLog | null {
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      for (let n = 1; n <= 9; n++) {
        const cells: [number, number][] = [];

        for (let dr = 0; dr < 3; dr++) {
          for (let dc = 0; dc < 3; dc++) {
            const r = br * 3 + dr;
            const c = bc * 3 + dc;
            if (cands[r][c].has(n)) cells.push([r, c]);
          }
        }

        if (cells.length < 2 || cells.length > 3) continue;

        // 全て同一行か？
        const rowSet = new Set(cells.map(([r]) => r));
        if (rowSet.size === 1) {
          const row = cells[0][0];
          const eliminations: Elimination[] = [];

          for (let c = 0; c < 9; c++) {
            if (Math.floor(c / 3) !== bc && cands[row][c].has(n)) {
              eliminations.push({ row, col: c, values: [n] });
            }
          }

          if (eliminations.length > 0) {
            return {
              technique: 'Pointing Pair',
              description: `ボックス(${br + 1},${bc + 1})内で ${n} は第${row + 1}行にしか存在しません（Pointing Pair）。この行の他のセルから ${n} を除去できます。`,
              affectedCells: [
                ...cells,
                ...eliminations.map(e => [e.row, e.col] as [number, number]),
              ],
              eliminations,
            };
          }
        }

        // 全て同一列か？
        const colSet = new Set(cells.map(([, c]) => c));
        if (colSet.size === 1) {
          const col = cells[0][1];
          const eliminations: Elimination[] = [];

          for (let r = 0; r < 9; r++) {
            if (Math.floor(r / 3) !== br && cands[r][col].has(n)) {
              eliminations.push({ row: r, col, values: [n] });
            }
          }

          if (eliminations.length > 0) {
            return {
              technique: 'Pointing Pair',
              description: `ボックス(${br + 1},${bc + 1})内で ${n} は第${col + 1}列にしか存在しません（Pointing Pair）。この列の他のセルから ${n} を除去できます。`,
              affectedCells: [
                ...cells,
                ...eliminations.map(e => [e.row, e.col] as [number, number]),
              ],
              eliminations,
            };
          }
        }
      }
    }
  }

  return null;
}

// ────────────────────────────────────────────────────────────
// 技法⑥ X-Wing
// ────────────────────────────────────────────────────────────
function xWing(cands: Candidates): StepLog | null {
  for (let n = 1; n <= 9; n++) {
    // 行ベース X-Wing
    const rowData: { row: number; cols: number[] }[] = [];
    for (let r = 0; r < 9; r++) {
      const cols: number[] = [];
      for (let c = 0; c < 9; c++) {
        if (cands[r][c].has(n)) cols.push(c);
      }
      if (cols.length === 2) rowData.push({ row: r, cols });
    }

    for (let i = 0; i < rowData.length; i++) {
      for (let j = i + 1; j < rowData.length; j++) {
        const d1 = rowData[i];
        const d2 = rowData[j];
        if (d1.cols[0] !== d2.cols[0] || d1.cols[1] !== d2.cols[1]) continue;

        const [c1, c2] = d1.cols;
        const [r1, r2] = [d1.row, d2.row];
        const eliminations: Elimination[] = [];

        for (let r = 0; r < 9; r++) {
          if (r === r1 || r === r2) continue;
          if (cands[r][c1].has(n)) eliminations.push({ row: r, col: c1, values: [n] });
          if (cands[r][c2].has(n)) eliminations.push({ row: r, col: c2, values: [n] });
        }

        if (eliminations.length > 0) {
          return {
            technique: 'X-Wing',
            description: `X-Wing: ${n} は第${r1 + 1}行と第${r2 + 1}行でそれぞれ第${c1 + 1}列・第${c2 + 1}列にしか現れません。これら2列の他の行から ${n} を除去できます。`,
            affectedCells: [
              [r1, c1], [r1, c2], [r2, c1], [r2, c2],
              ...eliminations.map(e => [e.row, e.col] as [number, number]),
            ],
            eliminations,
          };
        }
      }
    }

    // 列ベース X-Wing
    const colData: { col: number; rows: number[] }[] = [];
    for (let c = 0; c < 9; c++) {
      const rows: number[] = [];
      for (let r = 0; r < 9; r++) {
        if (cands[r][c].has(n)) rows.push(r);
      }
      if (rows.length === 2) colData.push({ col: c, rows });
    }

    for (let i = 0; i < colData.length; i++) {
      for (let j = i + 1; j < colData.length; j++) {
        const d1 = colData[i];
        const d2 = colData[j];
        if (d1.rows[0] !== d2.rows[0] || d1.rows[1] !== d2.rows[1]) continue;

        const [r1, r2] = d1.rows;
        const [c1, c2] = [d1.col, d2.col];
        const eliminations: Elimination[] = [];

        for (let c = 0; c < 9; c++) {
          if (c === c1 || c === c2) continue;
          if (cands[r1][c].has(n)) eliminations.push({ row: r1, col: c, values: [n] });
          if (cands[r2][c].has(n)) eliminations.push({ row: r2, col: c, values: [n] });
        }

        if (eliminations.length > 0) {
          return {
            technique: 'X-Wing',
            description: `X-Wing: ${n} は第${c1 + 1}列と第${c2 + 1}列でそれぞれ第${r1 + 1}行・第${r2 + 1}行にしか現れません。これら2行の他の列から ${n} を除去できます。`,
            affectedCells: [
              [r1, c1], [r1, c2], [r2, c1], [r2, c2],
              ...eliminations.map(e => [e.row, e.col] as [number, number]),
            ],
            eliminations,
          };
        }
      }
    }
  }

  return null;
}

// ────────────────────────────────────────────────────────────
// 技法⑦ Swordfish
// ────────────────────────────────────────────────────────────
function swordfish(cands: Candidates): StepLog | null {
  for (let n = 1; n <= 9; n++) {
    // 行ベース Swordfish
    const rowData: { row: number; cols: Set<number> }[] = [];
    for (let r = 0; r < 9; r++) {
      const cols = new Set<number>();
      for (let c = 0; c < 9; c++) {
        if (cands[r][c].has(n)) cols.add(c);
      }
      if (cols.size >= 2 && cols.size <= 3) rowData.push({ row: r, cols });
    }

    for (let i = 0; i < rowData.length; i++) {
      for (let j = i + 1; j < rowData.length; j++) {
        for (let k = j + 1; k < rowData.length; k++) {
          const union = new Set([
            ...rowData[i].cols,
            ...rowData[j].cols,
            ...rowData[k].cols,
          ]);

          if (union.size !== 3) continue;

          const rows = [rowData[i].row, rowData[j].row, rowData[k].row];
          const cols = [...union];
          const eliminations: Elimination[] = [];

          for (let r = 0; r < 9; r++) {
            if (rows.includes(r)) continue;
            for (const c of cols) {
              if (cands[r][c].has(n)) eliminations.push({ row: r, col: c, values: [n] });
            }
          }

          if (eliminations.length > 0) {
            return {
              technique: 'Swordfish',
              description: `Swordfish: ${n} は第${rows.map(r => r + 1).join(', ')}行でそれぞれ第${cols.map(c => c + 1).join(', ')}列にしか現れません。これら3列の他の行から ${n} を除去できます。`,
              affectedCells: [
                ...rows.flatMap(r => cols.map(c => [r, c] as [number, number])),
                ...eliminations.map(e => [e.row, e.col] as [number, number]),
              ],
              eliminations,
            };
          }
        }
      }
    }

    // 列ベース Swordfish
    const colData: { col: number; rows: Set<number> }[] = [];
    for (let c = 0; c < 9; c++) {
      const rows = new Set<number>();
      for (let r = 0; r < 9; r++) {
        if (cands[r][c].has(n)) rows.add(r);
      }
      if (rows.size >= 2 && rows.size <= 3) colData.push({ col: c, rows });
    }

    for (let i = 0; i < colData.length; i++) {
      for (let j = i + 1; j < colData.length; j++) {
        for (let k = j + 1; k < colData.length; k++) {
          const union = new Set([
            ...colData[i].rows,
            ...colData[j].rows,
            ...colData[k].rows,
          ]);

          if (union.size !== 3) continue;

          const cols = [colData[i].col, colData[j].col, colData[k].col];
          const rows = [...union];
          const eliminations: Elimination[] = [];

          for (let c = 0; c < 9; c++) {
            if (cols.includes(c)) continue;
            for (const r of rows) {
              if (cands[r][c].has(n)) eliminations.push({ row: r, col: c, values: [n] });
            }
          }

          if (eliminations.length > 0) {
            return {
              technique: 'Swordfish',
              description: `Swordfish: ${n} は第${cols.map(c => c + 1).join(', ')}列でそれぞれ第${rows.map(r => r + 1).join(', ')}行にしか現れません。これら3行の他の列から ${n} を除去できます。`,
              affectedCells: [
                ...rows.flatMap(r => cols.map(c => [r, c] as [number, number])),
                ...eliminations.map(e => [e.row, e.col] as [number, number]),
              ],
              eliminations,
            };
          }
        }
      }
    }
  }

  return null;
}

// ────────────────────────────────────────────────────────────
// 技法⑧ XY-Wing
// ────────────────────────────────────────────────────────────
function xyWing(cands: Candidates): StepLog | null {
  for (let pr = 0; pr < 9; pr++) {
    for (let pc = 0; pc < 9; pc++) {
      if (cands[pr][pc].size !== 2) continue;

      const [a, b] = [...cands[pr][pc]];

      // ピンサー候補セルを収集
      for (let r1 = 0; r1 < 9; r1++) {
        for (let c1 = 0; c1 < 9; c1++) {
          if (r1 === pr && c1 === pc) continue;
          if (!seesEachOther(pr, pc, r1, c1)) continue;
          if (cands[r1][c1].size !== 2) continue;

          // ピンサー1 は A を持ち、もう1つは C
          if (!cands[r1][c1].has(a)) continue;
          const cv = [...cands[r1][c1]].find(x => x !== a)!;
          if (cv === b) continue; // AB でなく AC が必要

          for (let r2 = 0; r2 < 9; r2++) {
            for (let c2 = 0; c2 < 9; c2++) {
              if (r2 === pr && c2 === pc) continue;
              if (r2 === r1 && c2 === c1) continue;
              if (!seesEachOther(pr, pc, r2, c2)) continue;
              if (cands[r2][c2].size !== 2) continue;
              // ピンサー2 は B と C を持つ
              if (!cands[r2][c2].has(b) || !cands[r2][c2].has(cv)) continue;

              // XY-Wing 発見: pivot(AB), pincer1(AC), pincer2(BC)
              // 両ピンサーを見えるセルから C を除去
              const eliminations: Elimination[] = [];

              for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                  if ((r === pr && c === pc) || (r === r1 && c === c1) || (r === r2 && c === c2)) continue;
                  if (seesEachOther(r, c, r1, c1) && seesEachOther(r, c, r2, c2)) {
                    if (cands[r][c].has(cv)) {
                      eliminations.push({ row: r, col: c, values: [cv] });
                    }
                  }
                }
              }

              if (eliminations.length > 0) {
                return {
                  technique: 'XY-Wing',
                  description: `XY-Wing: ピボット(${pr + 1}行${pc + 1}列)[${a},${b}] ─ ピンサー1(${r1 + 1}行${c1 + 1}列)[${a},${cv}] ─ ピンサー2(${r2 + 1}行${c2 + 1}列)[${b},${cv}]。両ピンサーから見えるセルの候補 ${cv} を除去できます。`,
                  affectedCells: [
                    [pr, pc], [r1, c1], [r2, c2],
                    ...eliminations.map(e => [e.row, e.col] as [number, number]),
                  ],
                  eliminations,
                };
              }
            }
          }
        }
      }
    }
  }

  return null;
}

// ────────────────────────────────────────────────────────────
// メイン solve 関数
// ────────────────────────────────────────────────────────────

/**
 * 盤面を論理的手法のみで解く。
 * @param inputBoard 0=空白、1-9=数字 の 9×9 配列
 * @returns SolveResult
 */
export function solve(inputBoard: number[][]): SolveResult {
  const board = cloneBoard(inputBoard);
  let cands = computeCandidates(board);
  const steps: StepLog[] = [];
  const usedTechniques = new Set<Technique>();
  const MAX_ITER = 500;

  for (let iter = 0; iter < MAX_ITER; iter++) {
    const hasEmpty = board.some(row => row.some(v => v === 0));
    if (!hasEmpty) break;

    let step: StepLog | null = null;
    let placed = false;

    // ① Naked Single
    step = nakedSingle(board, cands);
    if (step) {
      const [r, c] = step.affectedCells[0];
      board[r][c] = step.value!;
      cands = computeCandidates(board);
      steps.push(step);
      usedTechniques.add(step.technique);
      placed = true;
    }

    if (!placed) {
      // ② Hidden Single
      step = hiddenSingle(board, cands);
      if (step) {
        const [r, c] = step.affectedCells[0];
        board[r][c] = step.value!;
        cands = computeCandidates(board);
        steps.push(step);
        usedTechniques.add(step.technique);
        placed = true;
      }
    }

    if (!placed) {
      // ③ Naked Pair
      step = nakedPair(cands);
      if (step?.eliminations?.length) {
        const prev = cloneCandidates(cands);
        for (const { row, col, values } of step.eliminations) {
          for (const v of values) cands[row][col].delete(v);
        }
        if (!candsEqual(prev, cands)) {
          steps.push(step);
          usedTechniques.add(step.technique);
          placed = true;
        }
      }
    }

    if (!placed) {
      // ④ Naked Triple
      step = nakedTriple(cands);
      if (step?.eliminations?.length) {
        const prev = cloneCandidates(cands);
        for (const { row, col, values } of step.eliminations) {
          for (const v of values) cands[row][col].delete(v);
        }
        if (!candsEqual(prev, cands)) {
          steps.push(step);
          usedTechniques.add(step.technique);
          placed = true;
        }
      }
    }

    if (!placed) {
      // ⑤ Pointing Pair
      step = pointingPair(cands);
      if (step?.eliminations?.length) {
        const prev = cloneCandidates(cands);
        for (const { row, col, values } of step.eliminations) {
          for (const v of values) cands[row][col].delete(v);
        }
        if (!candsEqual(prev, cands)) {
          steps.push(step);
          usedTechniques.add(step.technique);
          placed = true;
        }
      }
    }

    if (!placed) {
      // ⑥ X-Wing
      step = xWing(cands);
      if (step?.eliminations?.length) {
        const prev = cloneCandidates(cands);
        for (const { row, col, values } of step.eliminations) {
          for (const v of values) cands[row][col].delete(v);
        }
        if (!candsEqual(prev, cands)) {
          steps.push(step);
          usedTechniques.add(step.technique);
          placed = true;
        }
      }
    }

    if (!placed) {
      // ⑦ Swordfish
      step = swordfish(cands);
      if (step?.eliminations?.length) {
        const prev = cloneCandidates(cands);
        for (const { row, col, values } of step.eliminations) {
          for (const v of values) cands[row][col].delete(v);
        }
        if (!candsEqual(prev, cands)) {
          steps.push(step);
          usedTechniques.add(step.technique);
          placed = true;
        }
      }
    }

    if (!placed) {
      // ⑧ XY-Wing
      step = xyWing(cands);
      if (step?.eliminations?.length) {
        const prev = cloneCandidates(cands);
        for (const { row, col, values } of step.eliminations) {
          for (const v of values) cands[row][col].delete(v);
        }
        if (!candsEqual(prev, cands)) {
          steps.push(step);
          usedTechniques.add(step.technique);
          placed = true;
        }
      }
    }

    if (!placed) break; // 詰まった
  }

  const solved = !board.some(row => row.some(v => v === 0));
  const techniques = [...usedTechniques] as Technique[];

  // 難易度算出
  let difficulty: Difficulty = 'beginner';
  if (usedTechniques.has('Swordfish') || usedTechniques.has('XY-Wing')) {
    difficulty = 'extreme';
  } else if (usedTechniques.has('X-Wing')) {
    difficulty = 'expert';
  } else if (
    usedTechniques.has('Naked Pair') ||
    usedTechniques.has('Naked Triple') ||
    usedTechniques.has('Pointing Pair')
  ) {
    difficulty = 'advanced';
  } else if (usedTechniques.has('Hidden Single')) {
    difficulty = 'intermediate';
  }

  return { board, steps, difficulty, solved, techniques };
}

/** 候補グリッドが変化したか判定（無限ループ防止用） */
function candsEqual(a: Candidates, b: Candidates): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!setsEqual(a[r][c], b[r][c])) return false;
    }
  }
  return true;
}

/**
 * 現在の盤面から次の1手のヒントを返す
 */
export function getNextHint(board: number[][]): StepLog | null {
  const cands = computeCandidates(board);

  return (
    nakedSingle(board, cands) ??
    hiddenSingle(board, cands) ??
    nakedPair(cands) ??
    nakedTriple(cands) ??
    pointingPair(cands) ??
    xWing(cands) ??
    swordfish(cands) ??
    xyWing(cands) ??
    null
  );
}

/**
 * バックトラック法で唯一解かを検証（最大2解まで探索）
 */
export function countSolutions(inputBoard: number[][]): number {
  const board = cloneBoard(inputBoard);
  let count = 0;

  function bt(): void {
    if (count >= 2) return;

    let minSize = 10;
    let targetR = -1;
    let targetC = -1;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== 0) continue;
        const s = getCandidateSize(board, r, c);
        if (s === 0) return; // 矛盾
        if (s < minSize) {
          minSize = s;
          targetR = r;
          targetC = c;
        }
      }
    }

    if (targetR === -1) {
      count++;
      return;
    }

    const nums = getCandidateList(board, targetR, targetC);
    for (const n of nums) {
      board[targetR][targetC] = n;
      bt();
      board[targetR][targetC] = 0;
      if (count >= 2) return;
    }
  }

  bt();
  return count;
}

function getCandidateSize(board: number[][], r: number, c: number): number {
  let count = 0;
  for (let n = 1; n <= 9; n++) {
    if (isValidPlacement(board, r, c, n)) count++;
  }
  return count;
}

function getCandidateList(board: number[][], r: number, c: number): number[] {
  const list: number[] = [];
  for (let n = 1; n <= 9; n++) {
    if (isValidPlacement(board, r, c, n)) list.push(n);
  }
  return list;
}

export function isValidPlacement(board: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      if (board[br + dr][bc + dc] === num) return false;
    }
  }
  return true;
}
