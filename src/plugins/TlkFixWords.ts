    // src/plugins/TlkFixWords.ts

    import { registerPlugin } from '@capacitor/core';

    // מגדיר לקוד ה-Web שקיימת פונקציה בשם saveUserWords באנדרואיד
    export interface TlkFixWordsPlugin {
      saveUserWords(options: { wordPairs: string }): Promise<void>;
    }

    // רושם את ה-Plugin תחת השם 'TlkFixWords'
    const TlkFixWords = registerPlugin<TlkFixWordsPlugin>('TlkFixWords');

    export default TlkFixWords;
    