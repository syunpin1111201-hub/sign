// 我喜歡上班：網頁外殼先跟網路拿最新的（拿不到才用手機裡存的），資料另外跟機器人拿
var V = 'app-v47', FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return Promise.all(FILES.map(function (u) { return fetch(new Request(u, { cache: 'reload' })).then(function (r) { if (r.ok) return c.put(u, r); }); })); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== V && x !== 'badge'; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  e.respondWith(caches.open(V).then(function (c) {
    return fetch(e.request, { cache: 'no-store' }).then(function (r) { if (r.ok) c.put(e.request, r.clone()); return r; })
      .catch(function () { return c.match(e.request, { ignoreSearch: true }); });
  }));
});

// 11/18 手機通知：機器人經 Firebase 推過來 → 跳通知；點了打開 App 那一頁
self.addEventListener('push', function (e) {
  var d = {};
  try { var j = e.data ? e.data.json() : {}; d = j.data || j; if (j.notification) { d.title = d.title || j.notification.title; d.body = d.body || j.notification.body; } } catch (x) { }
  var bump = caches.open('badge').then(function (c) { return c.match('/n').then(function (r) { return r ? r.text() : '0'; }).then(function (x) { var n = (parseInt(x, 10) || 0) + 1; c.put('/n', new Response(String(n))); if (self.navigator && self.navigator.setAppBadge) return self.navigator.setAppBadge(n); }); }).catch(function () { });   // 圖示紅點 +1
  e.waitUntil(Promise.all([bump, self.registration.showNotification(d.title || '八曜和茶', { body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', data: { link: d.link || './' } })]));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data || {}).link || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) if (cs[i].url.indexOf('/sign/app/') >= 0 && 'focus' in cs[i]) { try { cs[i].navigate(url); } catch (x) { } return cs[i].focus(); }
    return self.clients.openWindow(url);
  }));
});
