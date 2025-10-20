// src/components/UserWordsSynchronizer.tsx

import { useAuth } from "@/components/AuthProvider";
import { useUserWordsSync } from "@/hooks/use-words";

/**
 * זוהי קומפוננטת רקע. תפקידה היחיד הוא להפעיל את סנכרון המילים
 * כשהמשתמש מחובר. היא לא מציגה שום דבר על המסך.
 */
export const UserWordsSynchronizer = () => {
  // קבל את פרטי המשתמש המחובר
  const { user } = useAuth();

  // הפעל את ה-Hook שיצרנו עם ה-ID של המשתמש.
  useUserWordsSync(user?.id);

  // הקומפוננטה לא צריכה להחזיר שום דבר ויזואלי
  return null;
};