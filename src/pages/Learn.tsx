import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useDailyLimit } from '@/hooks/use-daily-limit';
import { useSpeechRecognition, fuzzyMatch } from '@/hooks/use-speech-recognition';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLearningLevel } from '@/hooks/use-learning-level';
import { useLetters, Letter, getLetterWordPair } from '@/hooks/use-letters';
import { BookOpen, Volume2, CheckCircle, ArrowLeft, ArrowRight, Crown, Lock, Mic, Sparkles, Type } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VocabularyWord {
  id: string;
  english_word: string;
  hebrew_translation: string;
  category: string;
  example_sentence: string;
  pronunciation?: string;
  word_pair: string;
  level?: string;
}

export const Learn: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const isHebrew = language === 'he';

  // Learning level hook
  const { level: learningLevel, loading: levelLoading } = useLearningLevel(user?.id);
  const { letters } = useLetters();
  const isLettersMode = learningLevel === 'letters';

  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null);
  const [currentLetter, setCurrentLetter] = useState<Letter | null>(null);
  const [categoryWords, setCategoryWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [learnedLetterPairs, setLearnedLetterPairs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Speech Practice Mode states
  const [speechPracticeMode, setSpeechPracticeMode] = useState(false);
  const [speechSuccess, setSpeechSuccess] = useState(false);
  const [showNextAfterSuccess, setShowNextAfterSuccess] = useState(false);

  const { canLearnMore, isPremium, remainingWords, refresh: refreshDailyLimit, dailyLimit, loading: limitLoading } = useDailyLimit(user?.id);

  // Filtered letters state (will be populated in loadLettersData)
  const [filteredLettersForNav, setFilteredLettersForNav] = useState<Letter[]>([]);

  // Navigation functions
  const nextWord = useCallback(() => {
    if (currentIndex < categoryWords.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentWord(categoryWords[newIndex]);
    }
  }, [currentIndex, categoryWords]);

  const nextItem = useCallback(() => {
    if (isLettersMode) {
      if (currentIndex < filteredLettersForNav.length - 1) {
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        setCurrentLetter(filteredLettersForNav[newIndex]);
      }
    } else {
      nextWord();
    }
  }, [isLettersMode, currentIndex, filteredLettersForNav, nextWord]);

  const previousItem = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      if (isLettersMode) {
        setCurrentLetter(filteredLettersForNav[newIndex]);
      } else {
        setCurrentWord(categoryWords[newIndex]);
      }
    }
  }, [currentIndex, isLettersMode, filteredLettersForNav, categoryWords]);

  // Speech recognition hook
  const handleSpeechResult = useCallback((transcript: string) => {
    const targetWord = isLettersMode ? currentLetter?.english_letter : currentWord?.english_word;
    if (!targetWord || !speechPracticeMode) return;

    const isMatch = fuzzyMatch(transcript, targetWord);

    if (isMatch) {
      setSpeechSuccess(true);
      setShowNextAfterSuccess(true);

      toast({
        title: isHebrew ? "מצוין! 🎉" : "Correct! 🎉",
        description: isHebrew
          ? `אמרת "${transcript}" - הגייה מושלמת!`
          : `You said "${transcript}" - Perfect pronunciation!`,
      });

      // Auto-advance after 1.5 seconds
      setTimeout(() => {
        if (speechPracticeMode) {
          nextItem();
          setSpeechSuccess(false);
          setShowNextAfterSuccess(false);
        }
      }, 1500);
    }
  }, [currentWord, currentLetter, speechPracticeMode, isHebrew, isLettersMode, nextItem]);

  const handleSpeechError = useCallback((error: string) => {
    toast({
      title: isHebrew ? "שגיאת דיבור" : "Speech Error",
      description: error,
      variant: "destructive",
    });
  }, [isHebrew]);

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError,
  });

  // Reset speech states when word/letter changes
  useEffect(() => {
    setSpeechSuccess(false);
    setShowNextAfterSuccess(false);
    resetTranscript();
  }, [currentWord, currentLetter, resetTranscript]);

  // Load letters data
  const loadLettersData = useCallback(async () => {
    if (!user || letters.length === 0) return;
    setLoading(true);

    try {
      const { data: learnedData } = await supabase
        .from('learned_words')
        .select('word_pair')
        .eq('user_id', user.id);

      const learnedPairs = new Set(learnedData?.map(item => item.word_pair) || []);
      setLearnedLetterPairs(learnedPairs);

      const isHebrewToEnglish = language === 'he';

      const unlearnedLetters = letters.filter(letter => {
        const wordPair = getLetterWordPair(letter, isHebrewToEnglish);
        return !learnedPairs.has(wordPair);
      });

      setFilteredLettersForNav(unlearnedLetters);
      setCurrentCategory(isHebrew ? 'אותיות' : 'Letters');

      if (unlearnedLetters.length > 0) {
        setCurrentIndex(0);
        setCurrentLetter(unlearnedLetters[0]);
      } else {
        setCurrentLetter(null);
      }
    } catch (error) {
      console.error('Error loading letters data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, letters, language, isHebrew]);

  // Helper function to maintain minimum words
  const maintainMinimumWords = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Checking word queue status...');
      const { count, error: countError } = await supabase
        .from('user_words')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['new', 'queued']);

      if (countError) {
        console.error('Error checking queue count:', countError);
        return;
      }

      console.log('Current queue count (new+queued):', count);

      if (count !== null && count < 20) {
        const needed = 20 - count;
        console.log(`Refill needed. Fetching ${needed} words...`);

        // Fetch existing IDs to exclude
        const { data: existingWords } = await supabase
          .from('user_words')
          .select('word_id')
          .eq('user_id', user.id);

        const existingIds = new Set(existingWords?.map(w => w.word_id) || []);

        const levelMap: { [key: string]: string[] } = {
          'basic': ['basic', 'beginner', 'elementary'],
          'intermediate': ['intermediate'],
          'advanced': ['advanced', 'upper-intermediate']
        };
        const levelValues = levelMap[learningLevel] || ['basic'];

        // Fetch candidates
        const { data: candidates, error: candidatesError } = await supabase
          .from('vocabulary_words')
          .select('id, priority, level, category')
          .in('level', levelValues)
          .order('priority', { ascending: false })
          .limit(50 + needed)
          .returns<any[]>();

        if (candidatesError) console.error('Error fetching candidates:', candidatesError);

        if (candidates) {
          const newWords = candidates
            .filter(w => !existingIds.has(w.id))
            .slice(0, needed);

          console.log(`Adding ${newWords.length} new words to queue`);

          if (newWords.length > 0) {
            const { error: insertError } = await supabase.from('user_words').insert(
              newWords.map(w => ({
                user_id: user.id,
                word_id: w.id,
                status: 'new' as any,
                view_count: 0
              }))
            );
            if (insertError) console.error('Error inserting new words:', insertError);
            else console.log('Successfully refilled queue.');
          }
        }
      }
    } catch (err) {
      console.error('Error in maintainMinimumWords:', err);
    }
  }, [user, learningLevel]);

  // Load vocabulary data
  const loadLearningData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Check if we need to refill (Strict Threshold)
      await maintainMinimumWords();

      // 2. Smart Lesson Query
      // Fetch user_words joined with vocabulary_words, excluding 'learned'
      const { data: userWordsData, error } = await supabase
        .from('user_words')
        .select(`
          id,
          status,
          view_count,
          vocabulary_words!user_words_word_id_fkey!inner (
            id,
            english_word,
            hebrew_translation,
            category,
            example_sentence,
            pronunciation,
            word_pair,
            level,
            priority
          )
        `)
        .eq('user_id', user.id)
        .neq('status', 'learned' as any)
        .order('status', { ascending: false }) // 'queued' comes after 'new' alphabetically? No. n... q... 
        // Wait, 'new' vs 'queued'. 'n' < 'q'. So 'queued' is last in ASC (new, queued). 
        // DESC: queued, new. Correct. (queued > new)
        .order('priority', { foreignTable: 'vocabulary_words', ascending: false })
        .order('view_count', { ascending: false })
        .limit(10)
        .returns<any[]>();

      if (error) {
        console.error('Error fetching user words lesson:', error);
        throw error;
      }

      console.log('User words fetched:', userWordsData?.length);

      const validItems = userWordsData?.filter(item => item.vocabulary_words) || [];
      console.log('Valid items (with vocab):', validItems.length);

      // Map to component format
      const lessonWords = validItems.map(item => ({
        ...(item.vocabulary_words as any),
        user_word_id: item.id
      }));

      if (lessonWords.length > 0) {
        setCategoryWords(lessonWords);
        setCurrentWord(lessonWords[0]);
        setCurrentIndex(0);
        // Set a default category name since we might mix categories
        setCurrentCategory(lessonWords[0].category || (isHebrew ? 'השיעור הבא' : 'Next Lesson'));
      } else {
        setCurrentWord(null);
        setCategoryWords([]);
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, learningLevel, isHebrew, maintainMinimumWords]);

  useEffect(() => {
    if (!user || levelLoading) return;
    if (isLettersMode) {
      loadLettersData();
    } else {
      loadLearningData();
    }
  }, [user, levelLoading, isLettersMode, loadLettersData, loadLearningData]);

  const markAsLearned = async () => {
    if (!user) return;
    if (!isPremium && !canLearnMore) {
      setShowUpgradeDialog(true);
      return;
    }

    try {
      if (isLettersMode && currentLetter) {
        const isHebrewToEnglish = language === 'he';
        const wordPair = getLetterWordPair(currentLetter, isHebrewToEnglish);

        await supabase.from('learned_words').insert({
          user_id: user.id,
          vocabulary_word_id: currentLetter.id,
          word_pair: wordPair
        });

        setLearnedLetterPairs(prev => new Set([...prev, wordPair]));
        const newFiltered = filteredLettersForNav.filter(l => l.id !== currentLetter.id);
        setFilteredLettersForNav(newFiltered);

        if (newFiltered.length > 0) {
          const nextIndex = Math.min(currentIndex, newFiltered.length - 1);
          setCurrentIndex(nextIndex);
          setCurrentLetter(newFiltered[nextIndex]);
        } else {
          setCurrentLetter(null);
        }
      } else if (currentWord) {
        // Update user_words status to 'learned'
        const userWordId = (currentWord as any).user_word_id;

        const updates = {
          status: 'learned',
          updated_at: new Date().toISOString()
        };

        if (userWordId) {
          await supabase
            .from('user_words')
            .update(updates as any)
            .eq('id', userWordId);
        } else {
          // Fallback
          await supabase
            .from('user_words')
            .update(updates as any)
            .eq('user_id', user.id)
            .eq('word_id', currentWord.id);
        }

        const newWords = categoryWords.filter(w => w.id !== currentWord.id);
        setCategoryWords(newWords);

        if (newWords.length > 0) {
          const nextIndex = Math.min(currentIndex, newWords.length - 1);
          setCurrentIndex(nextIndex);
          setCurrentWord(newWords[nextIndex]);
        } else {
          setCurrentWord(null);
          // Optional: Load more?
          loadLearningData();
        }
      }

      await refreshDailyLimit();
    } catch (error) {
      console.error('Error marking as learned:', error);
    } finally {
      // Continuous Check: refills queue if needed
      maintainMinimumWords();
    }
  }


  const speakItem = () => {
    if ('speechSynthesis' in window) {
      const text = isLettersMode ? currentLetter?.english_letter : currentWord?.english_word;
      if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const totalItems = isLettersMode ? filteredLettersForNav.length : categoryWords.length;
  const progress = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0;

  if (loading || limitLoading || levelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">{isHebrew ? 'טוען...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const hasContent = isLettersMode ? currentLetter !== null : currentWord !== null;

  if (!hasContent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{isHebrew ? 'כל הכבוד!' : 'Well done!'}</h2>
          <Button onClick={() => navigate('/learned')} className="glow-primary">
            {isHebrew ? 'צפה במה שלמדת' : 'View learned words'}
          </Button>
        </div>
      </div>
    );
  }

  const displayTitle = isLettersMode ? currentLetter?.english_letter : currentWord?.english_word;
  const displayTranslation = isLettersMode ? currentLetter?.hebrew_letter : currentWord?.hebrew_translation;
  const displayDescription = isLettersMode ? currentLetter?.phonetic_description : currentWord?.example_sentence;

  return (
    <div className="flex-1 flex flex-col w-full overflow-hidden relative" style={{ height: 'calc(100vh - 4.5rem)' }}>
      {/* Background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 -translate-y-1/2 -right-[150px] w-[600px] h-full bg-primary/10 blur-[150px]" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-[150px] w-[500px] h-full bg-accent/10 blur-[150px]" />
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-2 md:py-4 relative z-10 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full gap-2 md:gap-3 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center glow-primary">
                {isLettersMode ? <Type className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" /> : <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />}
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className="text-base md:text-lg font-bold leading-tight">
                  {isLettersMode ? (isHebrew ? 'לימוד אותיות' : 'Letter Learning') : (isHebrew ? 'שיעור פעיל' : 'Active Lesson')}
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground">{currentCategory}</p>
              </div>
            </div>
            <Badge className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 font-bold shadow-lg shadow-primary/10">
              <Sparkles className="h-3 w-3 mr-1 md:mr-2 text-primary" />
              <span className="text-white drop-shadow-md">
                {currentIndex + 1} / {totalItems}
              </span>
            </Badge>
          </div>

          {/* Progress area - simplified */}
          <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-1 text-[10px]">
              <span className="text-primary font-bold tracking-tight bg-primary/10 px-2 py-0.5 rounded-full">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-1 md:h-1.5 bg-white/5" />
          </div>

          {/* Daily Limit */}
          {!isPremium && (
            <div className="glass-card rounded-xl p-2 md:p-2.5 border-primary/30 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] md:text-xs font-medium">
                    {isHebrew ? `${remainingWords} נותרו` : `${remainingWords} left`}
                  </span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => navigate('/pricing')} className="h-6 md:h-7 text-[10px] md:text-xs text-primary px-2">
                  {isHebrew ? 'שדרג' : 'Upgrade'}
                </Button>
              </div>
            </div>
          )}

          {/* Main Area - Dynamic height */}
          <div className="flex-1 flex flex-col gap-2 md:gap-3 min-h-0 overflow-hidden">
            {/* Speech Toggle */}
            {isSupported && (
              <div className="glass-card rounded-xl md:rounded-2xl p-2 md:p-3 border-accent/20 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="h-3.5 w-3.5 text-accent" />
                    <span className="text-[10px] md:text-xs font-bold">{isHebrew ? 'תרגול דיבור' : 'Speech Practice'}</span>
                  </div>
                  <Switch checked={speechPracticeMode} onCheckedChange={setSpeechPracticeMode} className="scale-75 md:scale-90" />
                </div>
              </div>
            )}

            {/* Card - Flex 1 and Min-H-0 to allow shrinking */}
            <Card className="flex-1 glass-card border-white/10 overflow-hidden shadow-xl flex flex-col min-h-0">
              <CardHeader className="text-center pb-1 md:pb-2 pt-3 md:pt-5 flex-shrink-0">
                <Badge className="mx-auto mb-1 md:mb-2 bg-primary/10 text-primary border-primary/20 scale-75 md:scale-90 font-bold tracking-widest uppercase">
                  {isLettersMode ? (isHebrew ? 'אות' : 'LETTER') : (isHebrew ? 'מילה' : 'WORD')}
                </Badge>
                <CardTitle className="text-3xl md:text-6xl lg:text-7xl font-black text-white mb-1 md:mb-2 tracking-tight line-clamp-1">
                  {displayTitle}
                </CardTitle>
                <Button onClick={speakItem} variant="outline" size="sm" className="mx-auto glass-button h-8 md:h-10 px-4 md:px-6 text-xs transform active:scale-95 transition-transform">
                  <Volume2 className="h-3.5 w-3.5 mr-2" /> {isHebrew ? 'הגייה' : 'Listen'}
                </Button>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-center gap-2 md:gap-4 pb-4 md:pb-6 px-4 md:px-8 min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 min-h-0 flex-grow-0">
                  <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-6 border-white/5 text-center bg-white/5 flex flex-col justify-center">
                    <p className="text-[8px] md:text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">{isHebrew ? 'תרגום' : 'Translation'}</p>
                    <p className="text-xl md:text-3xl lg:text-4xl font-black text-white leading-tight">{displayTranslation}</p>
                    {isLettersMode && currentLetter?.pronunciation && (
                      <p className="text-[10px] md:text-xs text-primary mt-1 font-bold">{currentLetter.pronunciation}</p>
                    )}
                  </div>
                  <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-6 border-white/5 text-center bg-white/5 flex flex-col justify-center">
                    <p className="text-[8px] md:text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">{isHebrew ? 'דוגמה' : 'Context'}</p>
                    <p className="text-xs md:text-base font-medium text-gray-200 italic leading-snug line-clamp-3">{displayDescription}</p>
                  </div>
                </div>

                {speechPracticeMode && (
                  <div className="glass-card rounded-xl p-2 md:p-3 border-accent/20 text-center animate-in slide-in-from-bottom-4 bg-accent/5 flex-shrink-0">
                    <div className="flex items-center justify-center gap-3">
                      <Button onClick={isListening ? stopListening : startListening} className={`h-9 md:h-11 px-4 md:px-8 text-xs md:text-sm font-bold ${isListening ? 'bg-red-500 animate-pulse' : 'bg-accent'}`}>
                        <Mic className="h-4 w-4 mr-2" /> {isListening ? (isHebrew ? 'מקשיב...' : 'Listening...') : (isHebrew ? 'תרגול דיבור' : 'Practice')}
                      </Button>
                      {speechSuccess && <span className="text-green-500 font-bold text-xs md:text-sm animate-in zoom-in-50">{isHebrew ? '✓ מצוין!' : '✓ Correct!'}</span>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Nav - Minimal height */}
          <div className="flex items-center justify-between py-1 md:py-3 flex-shrink-0 border-t border-white/5">
            <Button onClick={previousItem} variant="ghost" disabled={currentIndex === 0} className="text-white/40 h-8 md:h-10 px-2 text-xs md:text-sm">
              <ArrowRight className="h-4 w-4 mr-1" /> {isHebrew ? 'הקודם' : 'Back'}
            </Button>
            <Button onClick={markAsLearned} className="bg-primary text-white px-8 md:px-14 py-4 md:py-5 text-sm md:text-base font-black rounded-lg md:rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
              {isHebrew ? 'למדתי!' : 'DONE!'}
            </Button>
            <Button onClick={nextItem} variant="ghost" disabled={currentIndex >= totalItems - 1} className="text-white/40 h-8 md:h-10 px-2 text-xs md:text-sm">
              {isHebrew ? 'דלג' : 'Skip'} <ArrowLeft className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
              {isHebrew ? 'הגעת לגבול היומי!' : 'Daily Limit Reached!'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-400">
              {isHebrew
                ? 'למדת את כל המילים להיום! כדי להמשיך ללמוד ללא הגבלה, שדרג לחשבון פרימיום.'
                : 'You have reached your daily limit! To continue learning without limits, upgrade to Premium.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="glass-button w-full sm:w-auto mt-0">
              {isHebrew ? 'אולי אחר כך' : 'Later'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/pricing')} className="bg-primary glow-primary w-full sm:w-auto">
              <Crown className="h-4 w-4 mr-2" />
              {isHebrew ? 'שדרג עכשיו' : 'Upgrade Now'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};

export default Learn;
