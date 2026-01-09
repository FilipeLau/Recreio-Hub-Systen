const CACHE_NAME = 'honda-hub-v4'; // Mudei para v3 para forçar atualização
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Bibliotecas Externas
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js'
];

// 1. Instalação
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força o novo Service Worker a assumir imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Cacheando arquivos estáticos');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Ativação (Limpeza de caches antigos)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('SW: Removendo cache antigo', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim(); // Controla a página imediatamente
});

// 3. Interceptação (ESTRATÉGIA NETWORK-FIRST)
// Tenta pegar na rede. Se conseguir, atualiza o cache e mostra.
// Se falhar (offline), pega do cache.
self.addEventListener('fetch', (event) => {
  // Apenas para requisições GET (páginas e arquivos)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for válida, clonamos ela para o cache novo
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // Se der erro (offline), tenta pegar do cache
        console.log('SW: Offline, buscando no cache');
        return caches.match(event.request);
      })
  );
});

