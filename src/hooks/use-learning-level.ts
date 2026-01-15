import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type LearningLevel = 'letters' | 'basic' | 'intermediate' | 'advanced';

interface LearningLevelData {
  level: LearningLevel;
  loading: boolean;
  updateLevel: (newLevel: LearningLevel) => Promise<void>;
  refreshLevel: () => Promise<void>;
}

export const useLearningLevel = (userId: string | undefined): LearningLevelData => {
  const [level, setLevel] = useState<LearningLevel>('basic');
  const [loading, setLoading] = useState(true);

  const fetchLevel = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('english_level')
        .eq('user_id', userId)
        .single();

      if (profile?.english_level) {
        // Map the english_level to our LearningLevel type
        const levelMap: { [key: string]: LearningLevel } = {
          'letters': 'letters',
          'beginner': 'basic',
          'elementary': 'basic',
          'intermediate': 'intermediate',
          'upper-intermediate': 'advanced',
          'advanced': 'advanced'
        };
        setLevel(levelMap[profile.english_level] || 'basic');
      }
    } catch (error) {
      console.error('Error fetching learning level:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLevel();
  }, [fetchLevel]);

  const updateLevel = async (newLevel: LearningLevel) => {
    if (!userId) return;

    try {
      // Map LearningLevel back to english_level format
      const levelDbMap: { [key: string]: string } = {
        'letters': 'letters',
        'basic': 'beginner',
        'intermediate': 'intermediate',
        'advanced': 'advanced'
      };

      const { error } = await supabase
        .from('profiles')
        .update({ english_level: levelDbMap[newLevel] })
        .eq('user_id', userId);

      if (error) throw error;
      setLevel(newLevel);
    } catch (error) {
      console.error('Error updating learning level:', error);
      throw error;
    }
  };

  return {
    level,
    loading,
    updateLevel,
    refreshLevel: fetchLevel
  };
};

// Get level label based on language
export const getLevelLabel = (level: LearningLevel, isHebrew: boolean): string => {
  const labels: { [key in LearningLevel]: { he: string; en: string } } = {
    letters: { he: 'אותיות בלבד', en: 'Letters Only' },
    basic: { he: 'בסיסי', en: 'Basic' },
    intermediate: { he: 'בינוני', en: 'Intermediate' },
    advanced: { he: 'מתקדם', en: 'Advanced' }
  };
  return isHebrew ? labels[level].he : labels[level].en;
};

// Get level description based on language
export const getLevelDescription = (level: LearningLevel, isHebrew: boolean): string => {
  const descriptions: { [key in LearningLevel]: { he: string; en: string } } = {
    letters: { 
      he: 'לימוד האלפבית האנגלי והמקבילות בעברית', 
      en: 'Learn the English alphabet and Hebrew equivalents' 
    },
    basic: { 
      he: 'מילים בסיסיות לשיחה יומיומית', 
      en: 'Basic words for daily conversation' 
    },
    intermediate: { 
      he: 'מילים לשיחות מורכבות יותר', 
      en: 'Words for more complex conversations' 
    },
    advanced: { 
      he: 'מילים מקצועיות ועסקיות', 
      en: 'Professional and business vocabulary' 
    }
  };
  return isHebrew ? descriptions[level].he : descriptions[level].en;
};
