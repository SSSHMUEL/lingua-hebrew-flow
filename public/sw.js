// שם המטמון. שנה את הגרסה (v1, v2 וכו') רק כשאתה משנה קבצים קריטיים.
const CACHE_NAME = 'talk-fix-cache-v1';

// רשימת הנכסים שה-Service Worker ישמור מיד בהתקנה.
// ייתכן שתרצה להוסיף קבצי CSS ו-JS נוספים אם הם סטטיים.
const urlsToCache = [
  '/',
  '/index.html',
  // נניח שזה קובץ ה-CSS הראשי, החלף אם השם שונה
  '/index.css',
  // קבצי אייקון ו-manifest
  '/favicon.ico',
  '/manifest.json',
  // נכסים נוספים כמו פונטים ותמונות קריטיות
  // "/images/logo.png", 
];

// שלב ההתקנה: שומר את הקבצים הקריטיים במטמון
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// שלב השליפה: קודם כל מנסה להגיש מהמטמון
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // אם הקובץ נמצא במטמון, החזר אותו.
        if (response) {
          return response;
        }
        // אחרת, פנה לרשת.
        return fetch(event.request);
      })
  );
});

// שלב הניקוי: מוחק מטמונים ישנים בעת עדכון
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});