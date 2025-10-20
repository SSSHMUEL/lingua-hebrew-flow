import { registerPlugin } from '@capacitor/core';

export interface TlkFixWordsPlugin {
  saveUserWords(options: { wordPairs: string }): Promise<void>;
}

const TlkFixWords = registerPlugin<TlkFixWordsPlugin>('TlkFixWords');

export default TlkFixWords;
