import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { App as CapacitorApp } from '@capacitor/app'
import { supabase } from '@/integrations/supabase/client'

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

// --- התחלה: מאזין ל־Capacitor appUrlOpen כדי לקלוט OAuth redirects ---
CapacitorApp.addListener('appUrlOpen', async (event) => {
  try {
    const url = event?.url || '';
    console.log('appUrlOpen URL:', url);

    // תמיכה ב־fragment (hash) וב־query
    if (url.includes('#access_token=') || url.includes('?access_token=')) {
      // ודא שה־supabase client מאותחל (מורדף ב׳/integrations/supabase/client׳)
      const { data, error } = await supabase.auth.getSessionFromUrl({ url });
      if (error) {
        console.error('Error getting session from URL:', error);
      } else {
        console.log('Session from URL:', data?.session);
        // כאן ניתן להוסיף לוגיקה נוספת אם רוצים להעביר את המשתמש לעמוד אחר
      }
    }
  } catch (e) {
    console.error('appUrlOpen handler exception:', e);
  }
});
// --- סיום: מאזין ל־Capacitor appUrlOpen ---

createRoot(document.getElementById("root")!).render(<App />);
