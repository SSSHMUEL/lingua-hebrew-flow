import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslationPair {
  id: string;
  sourceWord: string;
  targetWord: string;
  sourceLanguage: string;
  targetLanguage: string;
  category: string;
  exampleSource?: string;
  exampleTarget?: string;
}

interface WordWithTranslation {
  translationId: string;
  sourceWord: {
    id: string;
    text: string;
    languageCode: string;
    pronunciation?: string;
  };
  targetWord: {
    id: string;
    text: string;
    languageCode: string;
    pronunciation?: string;
  };
  category: string;
  exampleSource?: string;
  exampleTarget?: string;
}

export const useTranslations = () => {
  const { sourceLanguage, targetLanguage } = useLanguage();

  const fetchTranslationPairs = async (): Promise<WordWithTranslation[]> => {
    // Fetch languages
    const { data: languages } = await supabase
      .from('languages')
      .select('id, code');

    if (!languages) return [];

    const sourceLangId = languages.find(l => l.code === sourceLanguage)?.id;
    const targetLangId = languages.find(l => l.code === targetLanguage)?.id;

    if (!sourceLangId || !targetLangId) return [];

    // Fetch word translations with related words
    const { data: translations, error } = await supabase
      .from('word_translations')
      .select(`
        id,
        category,
        example_sentence_1,
        example_sentence_2,
        word_1:words!word_id_1(id, word_text, language_id, pronunciation),
        word_2:words!word_id_2(id, word_text, language_id, pronunciation)
      `);

    if (error || !translations) {
      console.error('Error fetching translations:', error);
      return [];
    }

    // Map and filter translations based on language direction
    const result: WordWithTranslation[] = [];

    for (const trans of translations) {
      const word1 = trans.word_1 as any;
      const word2 = trans.word_2 as any;

      if (!word1 || !word2) continue;

      let sourceWord, targetWord;
      let exampleSource, exampleTarget;

      // Determine which word is source and which is target
      if (word1.language_id === sourceLangId && word2.language_id === targetLangId) {
        sourceWord = word1;
        targetWord = word2;
        exampleSource = trans.example_sentence_1;
        exampleTarget = trans.example_sentence_2;
      } else if (word2.language_id === sourceLangId && word1.language_id === targetLangId) {
        sourceWord = word2;
        targetWord = word1;
        exampleSource = trans.example_sentence_2;
        exampleTarget = trans.example_sentence_1;
      } else {
        continue; // Not matching our language pair
      }

      result.push({
        translationId: trans.id,
        sourceWord: {
          id: sourceWord.id,
          text: sourceWord.word_text,
          languageCode: sourceLanguage,
          pronunciation: sourceWord.pronunciation,
        },
        targetWord: {
          id: targetWord.id,
          text: targetWord.word_text,
          languageCode: targetLanguage,
          pronunciation: targetWord.pronunciation,
        },
        category: trans.category,
        exampleSource,
        exampleTarget,
      });
    }

    return result;
  };

  const fetchLearnedPairs = async (userId: string): Promise<Set<string>> => {
    const { data } = await (supabase as any)
      .from('user_learned_words')
      .select('translation_pair_id')
      .eq('user_id', userId);

    return new Set(data?.map((item: any) => item.translation_pair_id) || []);
  };

  const markAsLearned = async (userId: string, translationPairId: string) => {
    const { error } = await (supabase as any)
      .from('user_learned_words')
      .insert({
        user_id: userId,
        translation_pair_id: translationPairId,
      });

    if (error && error.code !== '23505') { // Ignore duplicate key error
      throw error;
    }
  };

  const unmarkAsLearned = async (userId: string, translationPairId: string) => {
    const { error } = await (supabase as any)
      .from('user_learned_words')
      .delete()
      .eq('user_id', userId)
      .eq('translation_pair_id', translationPairId);

    if (error) throw error;
  };

  const exportLearnedWords = async (
    userId: string, 
    source: string = sourceLanguage, 
    target: string = targetLanguage
  ): Promise<Record<string, string>> => {
    // Fetch languages
    const { data: languages } = await supabase
      .from('languages')
      .select('id, code');

    if (!languages) return {};

    const sourceLangId = languages.find(l => l.code === source)?.id;
    const targetLangId = languages.find(l => l.code === target)?.id;

    if (!sourceLangId || !targetLangId) return {};

    // Fetch user's learned words with translations
    const { data: learnedData } = await (supabase as any)
      .from('user_learned_words')
      .select(`
        translation_pair_id,
        word_translations!inner(
          id,
          word_1:words!word_id_1(id, word_text, language_id),
          word_2:words!word_id_2(id, word_text, language_id)
        )
      `)
      .eq('user_id', userId);

    if (!learnedData) return {};

    const result: Record<string, string> = {};

    for (const learned of learnedData) {
      const trans = learned.word_translations as any;
      if (!trans) continue;

      const word1 = trans.word_1;
      const word2 = trans.word_2;

      if (!word1 || !word2) continue;

      // Determine source and target based on requested direction
      if (word1.language_id === sourceLangId && word2.language_id === targetLangId) {
        result[word1.word_text] = word2.word_text;
      } else if (word2.language_id === sourceLangId && word1.language_id === targetLangId) {
        result[word2.word_text] = word1.word_text;
      }
    }

    return result;
  };

  return {
    fetchTranslationPairs,
    fetchLearnedPairs,
    markAsLearned,
    unmarkAsLearned,
    exportLearnedWords,
  };
};
