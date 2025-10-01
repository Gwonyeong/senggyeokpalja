// Service Worker - 성격팔자 앱용
const CACHE_NAME = 'senggyeokpalja-v1';
const urlsToCache = [
  '/',
  '/assets/images/logo.png',
  '/assets/images/favicon.ico'
];

// 설치 이벤트
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating');

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// 패치 이벤트 - 네트워크 우선 전략
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // 유효한 응답인지 확인
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 응답을 복제하여 캐시에 저장
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(function(cache) {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(function() {
        // 네트워크 실패 시 캐시에서 찾기
        return caches.match(event.request);
      })
  );
});