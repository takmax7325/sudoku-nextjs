// ============================================================
// sw.js — Service Worker (PWA オフライン対応)
// ============================================================

const CACHE_NAME = 'sudoku-pwa-v1';
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
];

// インストール時にキャッシュをプリフェッチ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// アクティベーション時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// フェッチ: Network First → Cache フォールバック
self.addEventListener('fetch', (event) => {
  // POST や chrome-extension はスキップ
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // レスポンスをキャッシュに保存
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // オフライン時はキャッシュから返す
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // HTML ナビゲーションはルートを返す
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('offline', { status: 503 });
        });
      })
  );
});
