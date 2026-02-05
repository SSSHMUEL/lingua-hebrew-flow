// src/hooks/use-words.ts

import { useEffect } from 'react';
// זהו הנתיב הנכון לקליינט של Supabase, כפי שלמדנו מהקובץ AuthProvider.tsx
import { supabase } from '@/integrations/supabase/client';
// מייבא את ה"גשר" שיצרנו בשלב הקודם
import TlkFixWords from '@/plugins/TlkFixWords';

/**
 * פונקציה זו שולפת, מעבדת ושולחת את המילים לקוד ה-Native
 */
const processAndSaveWords = async (userId: string) => {
    if (!userId) return;

    // שלב 1: שליפת הנתונים המסוננים מ-Supabase לפי המשתמש
    // מביאים מ-user_words איפה שהסטטוס הוא 'learned'
    const { data: userWords, error } = await supabase
        .from('user_words')
        .select(`
                word_id, 
                vocabulary_words!user_words_word_id_fkey (
                    english_word, 
                    hebrew_translation
                )
            `)
        .eq('user_id', userId)
        .eq('status', 'learned');

    if (error || !userWords) {
        console.error("שגיאה בשליפת המילים מ-Supabase:", error);
        return;
    }

    // שלב 2: עיבוד הנתונים לפורמט שהאנדרואיד מצפה לו
    const wordPairsMap: { [hebrew: string]: string } = {};

    if (userWords) {
        userWords.forEach(item => {
            const vw = item.vocabulary_words as any;
            if (vw) {
                wordPairsMap[vw.hebrew_translation] = vw.english_word;
            }
        });
    }

    // שלב 3: שליחת המידע המעובד לאנדרואיד דרך הפלאגין
    try {
        await TlkFixWords.saveUserWords({
            wordPairs: JSON.stringify(wordPairsMap)
        });
        console.log("✅ הצלחה: המילים נשלחו לאחסון ה-Native!");
    } catch (e) {
        console.error("❌ שגיאה: הקריאה לפלאגין נכשלה:", e);
    }
};

/**
 * זהו ה-Hook שיפעיל את כל התהליך אוטומטית
 */
export const useUserWordsSync = (userId: string | undefined) => {
    // הקוד ירוץ אוטומטית כשה-userId יהיה זמין
    useEffect(() => {
        if (userId) {
            processAndSaveWords(userId);
        }
    }, [userId]);
};
