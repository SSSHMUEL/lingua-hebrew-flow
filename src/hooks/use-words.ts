// src/hooks/use-words.ts (גרסת בדיקה זמנית)

import { useEffect } from 'react';
import TlkFixWords from '@/plugins/TlkFixWords';

const sendDummyWordsToNative = async (userId: string) => {
    console.log("✅ [Web Debug] 1. מתחיל תהליך שליחת מילים קבועות עבור משתמש:", userId);

    const dummyWordPairs = {
        "בדיקה": "Success",
        "עובד": "It Works"
    };

    console.log("✅ [Web Debug] 2. המילים הקבועות מוכנות:", dummyWordPairs);

    try {
        await TlkFixWords.saveUserWords({
            wordPairs: JSON.stringify(dummyWordPairs)
        });
        console.log("✅✅✅ [Web Debug] 3. הצלחה! המילים נשלחו לאחסון ה-Native!");
    } catch (e) {
        console.error("❌❌❌ [Web Debug] 3a. שגיאה! הקריאה לפלאגין נכשלה:", e);
    }
};

export const useUserWordsSync = (userId: string | undefined) => {
    useEffect(() => {
        console.log("✅ [Web Debug] 0. ה-Hook useUserWordsSync הופעל. ה-ID של המשתמש הוא:", userId);
        if (userId) {
            sendDummyWordsToNative(userId);
        } else {
             console.log("✅ [Web Debug] 0a. עדיין אין ID של משתמש.");
        }
    }, [userId]);
};