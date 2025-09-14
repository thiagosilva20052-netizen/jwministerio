const CACHE_NAME = 'asistente-ministerio-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/vite.svg',
  '/manifest.json'
];

// Evento de instalación: abre un caché y añade los archivos del shell de la aplicación.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto y listo para precachear recursos');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento de activación: limpia los cachés antiguos para evitar conflictos.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento de fetch: implementa la estrategia Stale-While-Revalidate.
self.addEventListener('fetch', event => {
  // Ignora las peticiones que no son GET, ya que no se pueden cachear.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Responde desde el caché si está disponible (Stale).
      const cachedResponse = await cache.match(event.request);

      // 2. Mientras tanto, busca una versión actualizada en la red (Revalidate).
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Si la petición de red es exitosa, actualiza el caché.
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(err => {
        // La petición de red falló. Esto es normal si no hay conexión.
        console.warn(`Petición de red fallida para ${event.request.url}:`, err);
      });

      // 3. Devuelve la respuesta del caché si existía. Si no, espera a la respuesta de la red.
      // Si la red también falla, la promesa se rechazará y se activará el .catch() del navegador.
      return cachedResponse || fetchPromise;
    })
  );
});
