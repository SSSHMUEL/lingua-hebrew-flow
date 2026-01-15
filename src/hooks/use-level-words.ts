import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LearningLevel } from './use-learning-level';

export interface VocabularyWord {
  id: string;
  english_word: string;
  hebrew_translation: string;
  category: string;
  example_sentence: string;
  pronunciation?: string;
  word_pair: string;
  level?: string;
}

interface UseLevelWordsResult {
  words: VocabularyWord[];
  loading: boolean;
  error: string | null;
  refreshWords: () => Promise<void>;
}

export const useLevelWords = (level: LearningLevel): UseLevelWordsResult => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWords = useCallback(async () => {
    // Letters level uses a different table
    if (level === 'letters') {
      setWords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Map level to database level values
      const levelMap: { [key: string]: string[] } = {
        'basic': ['basic', 'beginner', 'elementary'],
        'intermediate': ['intermediate'],
        'advanced': ['advanced', 'upper-intermediate']
      };

      const levelValues = levelMap[level] || ['basic'];

      const { data, error: fetchError } = await supabase
        .from('vocabulary_words')
        .select('*')
        .in('level', levelValues)
        .order('category', { ascending: true })
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setWords(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching level words:', err);
      setError('Failed to load words');
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  return { words, loading, error, refreshWords: fetchWords };
};
