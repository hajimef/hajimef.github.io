// 魁タイマー：電波がなくても開けるように、アプリの中身をスマホに保存しておく
// 新しい版を置いたら、この VERSION を変える（変えると、次に開いたときに新しい版へ切り替わる）
var VERSION = "v208";
var CACHE = "sakigake-timer-" + VERSION;
var FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) {
      if (k.indexOf("sakigake-timer-") === 0 && k !== CACHE) return caches.delete(k);   // 古い版を消す
    }));
  }).then(function () { return self.clients.claim(); }));
});

// 保存してあるものをすぐ出す（電波がなくても開ける）。電波があれば裏で新しいものに取りかえておく
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) c.put(req, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
