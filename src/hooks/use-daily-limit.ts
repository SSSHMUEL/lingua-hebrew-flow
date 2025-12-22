import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const FREE_DAILY_LIMIT = 5;

interface DailyLimitState {
  wordsLearnedToday: number;
  canLearnMore: boolean;
  isPremium: boolean;
  loading: boolean;
  remainingWords: number;
}

export const useDailyLimit = (userId: string | undefined) => {
  const [state, setState] = useState<DailyLimitState>({
    wordsLearnedToday: 0,
    canLearnMore: true,
    isPremium: false,
    loading: true,
    remainingWords: FREE_DAILY_LIMIT,
  });

  const checkSubscriptionStatus = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;
    
    const { data } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .single();
    
    if (!data) return false;
    
    // User is premium if status is 'active' and period hasn't ended
    if (data.status === 'active' && data.current_period_end) {
      const endDate = new Date(data.current_period_end);
      return endDate > new Date();
    }
    
    return false;
  }, [userId]);

  const countWordsLearnedToday = useCallback(async (): Promise<number> => {
    if (!userId) return 0;
    
    // Get today's start in UTC
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const { count } = await supabase
      .from('learned_words')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('learned_at', todayISO);
    
    return count || 0;
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setState({
        wordsLearnedToday: 0,
        canLearnMore: false,
        isPremium: false,
        loading: false,
        remainingWords: 0,
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    const [isPremium, wordsLearnedToday] = await Promise.all([
      checkSubscriptionStatus(),
      countWordsLearnedToday(),
    ]);

    const remainingWords = isPremium ? Infinity : Math.max(0, FREE_DAILY_LIMIT - wordsLearnedToday);
    const canLearnMore = isPremium || wordsLearnedToday < FREE_DAILY_LIMIT;

    setState({
      wordsLearnedToday,
      canLearnMore,
      isPremium,
      loading: false,
      remainingWords,
    });
  }, [userId, checkSubscriptionStatus, countWordsLearnedToday]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    refresh,
    dailyLimit: FREE_DAILY_LIMIT,
  };
};
