#!/usr/bin/env bash
# ============================================================
# setup.sh — セットアップ & 起動スクリプト
# ============================================================

set -e

echo "🔢 数独 PWA セットアップ開始..."
echo ""

# Node.js バージョン確認
NODE_VER=$(node -v 2>/dev/null || echo "none")
if [ "$NODE_VER" = "none" ]; then
  echo "❌ Node.js がインストールされていません。"
  echo "   https://nodejs.org/ からインストールしてください (v18 以上推奨)"
  exit 1
fi
echo "✅ Node.js $NODE_VER"

# npm install
echo ""
echo "📦 依存関係をインストール中..."
npm install

echo ""
echo "✅ インストール完了！"
echo ""
echo "🚀 開発サーバーを起動します..."
echo "   ブラウザで http://localhost:3000 を開いてください"
echo ""
npm run dev
