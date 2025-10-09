import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// --- התחלה: קוד חדש לרישום Service Worker (לצורך אופליין) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // רישום קובץ ה-Service Worker שנמצא בתיקיית public
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker נרשם בהצלחה:', registration.scope);
      })
      .catch(error => {
        console.error('כישלון ברישום Service Worker:', error);
      });
  });
}
// --- סיום: קוד חדש לרישום Service Worker ---


createRoot(document.getElementById("root")!).render(<App />);