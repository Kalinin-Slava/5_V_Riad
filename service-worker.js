// Service worker для офлайн-игры: отдаёт из кэша сразу (быстрый старт и работа без
// интернета), параллельно обновляет кэш из сети, если она доступна. Кэширует и свои
// файлы, и рантайм CDN (интерпретатор/pygame), которые запрашивает pygbag при загрузке.

const CACHE_NAME = "5-v-ryad-cache-v1";

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            const networkFetch = fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                    }
                    return response;
                })
                .catch(() => cached);

            return cached || networkFetch;
        })
    );
});
