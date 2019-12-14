var cacheName = "talknow";
var filesToCache = ["/", "/index.html", "/style.css", "/gif.js", "/chat.js"];
self.addEventListener("install", function(e) {
  console.log("[ServiceWorker] Install");
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log("[ServiceWorker] Caching app shell");
      return cache.addAll(filesToCache);
    })
  );
});
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      return response || fetch(event.request);
    })
  );
});
self.addEventListener("push", ev => {
  const data = ev.data.json();
  console.log("Got push", data);
  self.registration.showNotification(data.title, {
    body: "Hello, World!"
  });
});
