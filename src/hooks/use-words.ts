// src/hooks/use-words.ts

import { useEffect } from 'react';
// ================== התיקון נמצא כאן ==================
// שיניתי את הנתיב כך שיצביע לקובץ utils.ts הנכון
import { supabase } from '@/lib/utils';
import TlkFixWords from '@/plugins/TlkFixWords';

const processAndSaveWords = async (userId: string) => {
    console.log('[TlkFix Debug] 1. מתחיל את תהליך שליפת ושליחת המילים עבור משתמש:', userId);

    if (!userId) {
        console.log('[TlkFix Debug] 1a. התהליך נעצר כי אין ID של משתמש.');
        return;
    }

    console.log('[TlkFix Debug] 2. שולף מילים מ-Supabase...');
    const { data: learnedWords, error } = await supabase
        .from('learned_words')
        .select('word_pair')
        .eq('user_id', userId);

    if (error || !learnedWords) {
        console.error("[TlkFix Debug] 2a. שגיאה בשליפת המילים מ-Supabase:", error);
        return;
    }

    console.log('[TlkFix Debug] 3. נשלפו בהצלחה', learnedWords.length, 'מילים מ-Supabase. מעבד את הנתונים...');
    const wordPairsMap: { [hebrew: string]: string } = {};
    learnedWords.forEach(row => {
        const parts = row.word_pair.split(' - ');
        if (parts.length === 2) {
            wordPairsMap[parts[0].trim()] = parts[1].trim();
        }
    });
    console.log('[TlkFix Debug] 4. המילים עובדו למפה הבאה:', wordPairsMap);

    console.log('[TlkFix Debug] 5. מנסה לשלוח את המילים לאנדרואיד דרך הפלאגין...');
    try {
        await TlkFixWords.saveUserWords({
            wordPairs: JSON.stringify(wordPairsMap)
        });
        console.log("✅ [TlkFix Debug] 6. הצלחה! המילים נשלחו לאחסון ה-Native!");
    } catch (e) {
        console.error("❌ [TlkFix Debug] 6a. שגיאה! הקריאה לפלאגין נכשלה:", e);
    }
};

export const useUserWordsSync = (userId: string | undefined) => {
    useEffect(() => {
        console.log('[TlkFix Debug] 0. ה-Hook useUserWordsSync הופעל. ה-ID של המשתמש הוא:', userId);
        if (userId) {
            processAndSaveWords(userId);
        } else {
             console.log('[TlkFix Debug] 0a. עדיין אין ID של משתמש.');
        }
    }, [userId]);
};