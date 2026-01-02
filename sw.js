const CACHE_NAME = 'honda-hub-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Ícones (se tiver as imagens na pasta)
  // 'https://logodownload.org/wp-content/uploads/2014/04/honda-motos-logo-01.png', 
  
  // Bibliotecas Externas (Essenciais para rodar offline)
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js'
];

// 1. Instalação: Baixa os arquivos para o cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching Files');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Ativação: Limpa caches antigos se mudar a versão
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// 3. Interceptação: Serve o cache se estiver offline, senão busca na rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se tiver no cache, retorna. Se não, busca na internet.
      return cachedResponse || fetch(event.request);
    })
  );
});

