// src/hooks/use-words.ts

import { useEffect } from 'react';
// נניח שזה הנתיב לקליינט ה-Supabase שלך. שנה בהתאם למבנה הפרויקט שלך.
import { supabase } from '../lib/supabase';
// נניח שזה הנתיב לפלאגין של Capacitor שיצרנו. שנה בהתאם.
import TlkFixWords from '../plugins/TlkFixWords';

/**
 * פונקציה זו שולפת, מעבדת ושולחת את המילים לקוד ה-Native
 */
const processAndSaveWords = async (userId: string) => {
    // אם אין ID של משתמש, אל תעשה כלום
    if (!userId) return;

    // שלב 1: שליפת הנתונים המסוננים מ-Supabase
    // אנחנו מבקשים רק את עמודת `word_pair` מהטבלה `learned_words`
    // ומשתמשים ב-eq כדי לסנן רק את השורות ששייכות למשתמש שלנו.
    const { data: learnedWords, error } = await supabase
        .from('learned_words')
        .select('word_pair')
        .eq('user_id', userId);

    if (error || !learnedWords) {
        console.error("Supabase Error fetching learned words:", error);
        return;
    }

    // שלב 2: עיבוד הנתונים לפורמט שהאנדרואיד מצפה לו
    // { "מילה בעברית": "word in english" }
    const wordPairsMap: { [hebrew: string]: string } = {};
    learnedWords.forEach(row => {
        // מפרק את המחרוזת "עברית - English" לפי המקף
        const parts = row.word_pair.split(' - ');
        if (parts.length === 2) {
            // החלק הראשון הוא המפתח (עברית), השני הוא הערך (אנגלית)
            wordPairsMap[parts[0].trim()] = parts[1].trim();
        }
    });

    // שלב 3: שליחת המידע המעובד לאנדרואיד דרך הפלאגין
    try {
        // חייבים להמיר את אובייקט ה-JS למחרוזת טקסט (JSON)
        await TlkFixWords.saveUserWords({
            wordPairs: JSON.stringify(wordPairsMap)
        });
        console.log("SUCCESS: Words sent to Native storage for user:", userId);
    } catch (e) {
        console.error("ERROR: Failed to call TlkFixWords plugin:", e);
    }
};

/**
 * זהו ה-Hook שיפעיל את כל התהליך אוטומטית
 * @param userId - ה-ID של המשתמש המחובר (יכול להיות undefined אם אף אחד לא מחובר)
 */
export const useUserWordsSync = (userId: string | undefined) => {
    // useEffect מריץ את הקוד שבתוכו כשהקומפוננטה נטענת,
    // או כשהערך של userId משתנה (כלומר, כשהמשתמש מתחבר/מתנתק).
    useEffect(() => {
        if (userId) {
            console.log("User detected, syncing words to native storage...");
            processAndSaveWords(userId);
        }
    }, [userId]);

    // ל-Hook הזה אין ערך החזרה, הוא רק מבצע פעולת רקע.
};