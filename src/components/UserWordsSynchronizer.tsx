// src/components/UserWordsSynchronizer.tsx (גרסת בדיקה ויזואלית)

import { useAuth } from "@/components/AuthProvider";
import { useUserWordsSync } from "@/hooks/use-words";

export const UserWordsSynchronizer = () => {
  // קבל את פרטי המשתמש המחובר
  const { user } = useAuth();

  // נסה להפעיל את סנכרון המילים (עם גרסת הבדיקה הקבועה מראש)
  useUserWordsSync(user?.id);

  // ================== שינוי לצורך בדיקה ==================
  // אנחנו נציג את ה-ID של המשתמש ישירות על המסך בתוך ריבוע צהוב.
  // זה יעזור לנו לראות אם הקוד הזה בכלל רץ, ואם הוא מזהה את המשתמש.
  return (
    <div style={{
      position: 'fixed',
      top: '60px', /* מתחת לכותרת העליונה */
      left: '10px',
      backgroundColor: 'yellow',
      color: 'black',
      padding: '10px',
      zIndex: 9999,
      border: '2px solid red',
      fontSize: '12px'
    }}>
      DEBUG: User ID is: {user?.id || 'NOT LOGGED IN'}
    </div>
  );
};