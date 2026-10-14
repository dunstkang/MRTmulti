const VERSION      = '2026.10.14-v1.6';   // ← 每次發布只改這一行
const CACHE_NAME   = `metro-${VERSION}`;
const CORE_ASSETS  = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './st-zhongshan.webp',
  './st-nanjing.webp',
  './st-zhongxiao.webp',
  './train.webp',
  './track.webp',
  './car1.webp',
  './car2.webp',
];

// 安裝：預先快取核心檔案，但不立刻 skipWaiting，
// 讓新版本先在背景待命，由使用者確認後才切換（避免遊戲玩到一半被打斷）。
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

// 啟用：清掉舊版本快取
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.map((n) => n !== CACHE_NAME && caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (e.data === 'GET_VERSION') {
    e.source.postMessage({ type: 'VERSION', version: VERSION });
  }
});

// 網路優先，離線時退回快取
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
