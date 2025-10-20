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
        const { data: learnedWords, error } = await supabase
            .from('learned_words')
            .select('word_pair')
            .eq('user_id', userId);

        if (error || !learnedWords) {
            console.error("שגיאה בשליפת המילים מ-Supabase:", error);
            return;
        }

        // שלב 2: עיבוד הנתונים לפורמט שהאנדרואיד מצפה לו
        const wordPairsMap: { [hebrew: string]: string } = {};
        learnedWords.forEach(row => {
            const parts = row.word_pair.split(' - ');
            if (parts.length === 2) {
                wordPairsMap[parts[0].trim()] = parts[1].trim();
            }
        });

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
    