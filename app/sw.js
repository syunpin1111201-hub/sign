// 我喜歡上班：網頁外殼先跟網路拿最新的（拿不到才用手機裡存的），資料另外跟機器人拿
var V = 'app-v11', FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return Promise.all(FILES.map(function (u) { return fetch(new Request(u, { cache: 'reload' })).then(function (r) { if (r.ok) return c.put(u, r); }); })); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== V; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  e.respondWith(caches.open(V).then(function (c) {
    return fetch(e.request, { cache: 'no-store' }).then(function (r) { if (r.ok) c.put(e.request, r.clone()); return r; })
      .catch(function () { return c.match(e.request, { ignoreSearch: true }); });
  }));
});
