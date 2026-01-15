import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Letter {
  id: string;
  english_letter: string;
  hebrew_letter: string;
  pronunciation: string;
  example_word: string;
  phonetic_description: string;
  display_order: number;
}

export const useLetters = () => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('letters')
          .select('*')
          .order('display_order', { ascending: true });

        if (fetchError) throw fetchError;
        setLetters(data || []);
      } catch (err) {
        console.error('Error fetching letters:', err);
        setError('Failed to load letters');
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
  }, []);

  return { letters, loading, error };
};

// Get letter pairs for the learned_words format
export const getLetterWordPair = (letter: Letter, isHebrewToEnglish: boolean): string => {
  if (isHebrewToEnglish) {
    // Hebrew source -> English target
    return `${letter.hebrew_letter} - ${letter.english_letter}`;
  } else {
    // English source -> Hebrew target
    return `${letter.english_letter} - ${letter.hebrew_letter}`;
  }
};
