// שם המטמון - שנה את הגרסה בכל עדכון!
const CACHE_NAME = 'talk-fix-cache-v3';

// רשימת נכסים סטטיים לשמירה
const urlsToCache = [
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
];

// שלב ההתקנה: skip waiting כדי להפעיל את ה-SW החדש מיד
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// שלב ההפעלה: מוחק את כל ה-caches הישנים ומשתלט מיד
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // השתלט על כל הטאבים הפתוחים
      return self.clients.claim();
    })
  );
});

// אסטרטגיית Network First - תמיד מנסה להביא מהרשת קודם
self.addEventListener('fetch', event => {
  // רק בקשות GET
  if (event.request.method !== 'GET') return;

  // התעלם מבקשות API ו-Supabase
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api') || 
      url.hostname.includes('supabase') ||
      url.pathname.includes('functions')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // שמור עותק ב-cache רק אם זו תשובה תקינה
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // אם הרשת לא זמינה, נסה מה-cache
        return caches.match(event.request);
      })
  );
});

// האזן להודעות לרענון מיידי
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
